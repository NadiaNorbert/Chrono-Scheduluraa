"""
Analytics service — aggregates data from tasks, habits, and calendar events
to produce productivity reports. No separate analytics table needed.
"""
from __future__ import annotations
from datetime import datetime, timezone, date, timedelta
from uuid import UUID

from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.models.user import User
from src.db.models.task import Task
from src.db.models.habit import Habit, HabitLog
from src.db.models.event import CalendarEvent
from src.core.logging import get_logger

logger = get_logger(__name__)


async def _get_user_id(db: AsyncSession, clerk_user_id: str) -> UUID:
    result = await db.execute(select(User.id).where(User.clerk_user_id == clerk_user_id))
    uid = result.scalar_one_or_none()
    if uid is None:
        raise ValueError(f"User not found: {clerk_user_id}")
    return uid


async def get_productivity_report(
    db: AsyncSession,
    clerk_user_id: str,
    period: str = "week",
) -> dict:
    """
    Build a productivity report for the given period (day/week/month).
    Returns a dict that maps to the AnalyticsReport response schema.
    """
    user_id = await _get_user_id(db, clerk_user_id)
    now     = datetime.now(timezone.utc)

    if period == "day":
        start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    elif period == "month":
        start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    else:  # week
        days_since_monday = now.weekday()
        start = (now - timedelta(days=days_since_monday)).replace(
            hour=0, minute=0, second=0, microsecond=0
        )

    # ── Tasks ────────────────────────────────────────────────────────────────
    tasks_created_result = await db.execute(
        select(func.count(Task.id)).where(
            and_(Task.user_id == user_id, Task.created_at >= start)
        )
    )
    tasks_created = tasks_created_result.scalar_one()

    tasks_completed_result = await db.execute(
        select(func.count(Task.id)).where(
            and_(Task.user_id == user_id, Task.completed_at >= start)
        )
    )
    tasks_completed = tasks_completed_result.scalar_one()

    overdue_result = await db.execute(
        select(func.count(Task.id)).where(
            and_(
                Task.user_id == user_id,
                Task.completed_at.is_(None),
                Task.due_at < now,
            )
        )
    )
    overdue_tasks = overdue_result.scalar_one()

    # Priority breakdown (completed tasks)
    completed_tasks_q = await db.execute(
        select(Task.priority, func.count(Task.id)).where(
            and_(Task.user_id == user_id, Task.completed_at >= start)
        ).group_by(Task.priority)
    )
    priority_breakdown = {str(row[0].value): row[1] for row in completed_tasks_q}

    # ── Habits ───────────────────────────────────────────────────────────────
    habit_logs_result = await db.execute(
        select(func.count(HabitLog.id)).where(
            and_(
                HabitLog.user_id == user_id,
                HabitLog.logged_date >= start.date(),
            )
        )
    )
    habit_completions = habit_logs_result.scalar_one()

    active_habits_result = await db.execute(
        select(func.count(Habit.id)).where(
            and_(Habit.user_id == user_id, Habit.is_active == True)  # noqa: E712
        )
    )
    active_habits = active_habits_result.scalar_one()

    # ── Calendar events ───────────────────────────────────────────────────────
    events_result = await db.execute(
        select(func.count(CalendarEvent.id)).where(
            and_(
                CalendarEvent.user_id == user_id,
                CalendarEvent.start_at >= start,
                CalendarEvent.start_at <= now,
            )
        )
    )
    events_attended = events_result.scalar_one()

    # Meeting minutes
    meeting_mins_result = await db.execute(
        select(CalendarEvent.start_at, CalendarEvent.end_at).where(
            and_(
                CalendarEvent.user_id == user_id,
                CalendarEvent.start_at >= start,
                CalendarEvent.start_at <= now,
                CalendarEvent.all_day == False,  # noqa: E712
            )
        )
    )
    meeting_minutes = sum(
        max(0, int((row.end_at - row.start_at).total_seconds() / 60))
        for row in meeting_mins_result
    )

    # ── Daily series (last 7 days) ────────────────────────────────────────────
    daily_series = []
    for i in range(6, -1, -1):
        day     = date.today() - timedelta(days=i)
        day_str = day.isoformat()

        tc_r = await db.execute(
            select(func.count(Task.id)).where(
                and_(
                    Task.user_id == user_id,
                    func.date(Task.completed_at) == day,
                )
            )
        )
        hl_r = await db.execute(
            select(func.count(HabitLog.id)).where(
                and_(HabitLog.user_id == user_id, HabitLog.logged_date == day)
            )
        )
        daily_series.append({
            "date":             day_str,
            "tasks_completed":  tc_r.scalar_one(),
            "habit_completions": hl_r.scalar_one(),
        })

    completion_rate = (
        round(tasks_completed / tasks_created * 100) if tasks_created > 0 else 0
    )
    habit_rate = (
        round(habit_completions / (active_habits * 7) * 100)
        if active_habits > 0 else 0
    )

    return {
        "period":             period,
        "start":              start.isoformat(),
        "generated_at":       now.isoformat(),
        "tasks_created":      tasks_created,
        "tasks_completed":    tasks_completed,
        "overdue_tasks":      overdue_tasks,
        "completion_rate":    min(completion_rate, 100),
        "priority_breakdown": priority_breakdown,
        "habit_completions":  habit_completions,
        "active_habits":      active_habits,
        "habit_rate":         min(habit_rate, 100),
        "events_attended":    events_attended,
        "meeting_minutes":    meeting_minutes,
        "daily_series":       daily_series,
    }
