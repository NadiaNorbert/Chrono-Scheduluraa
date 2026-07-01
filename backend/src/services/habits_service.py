"""
Habits service — CRUD + streak calculation.
"""
from __future__ import annotations
from datetime import datetime, timezone, date, timedelta
from uuid import UUID

from sqlalchemy import select, func, and_, desc
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.models.habit import Habit, HabitLog, HabitFrequency
from src.db.models.user import User
from src.schemas.habits import HabitCreate, HabitUpdate, HabitLogCreate, HabitRead
from src.core.logging import get_logger

logger = get_logger(__name__)


async def _get_user_id(db: AsyncSession, clerk_user_id: str) -> UUID:
    result = await db.execute(select(User.id).where(User.clerk_user_id == clerk_user_id))
    uid = result.scalar_one_or_none()
    if uid is None:
        raise ValueError(f"User not found: {clerk_user_id}")
    return uid


# ── CRUD ───────────────────────────────────────────────────────────────────────

async def create_habit(db: AsyncSession, clerk_user_id: str, payload: HabitCreate) -> Habit:
    user_id = await _get_user_id(db, clerk_user_id)
    habit = Habit(
        user_id=user_id,
        title=payload.title,
        description=payload.description,
        frequency=HabitFrequency(payload.frequency),
        target_days=payload.target_days,
        color=payload.color,
        icon=payload.icon,
    )
    db.add(habit)
    await db.flush()
    logger.info("Habit created id=%s", habit.id)
    return habit


async def get_habit(db: AsyncSession, habit_id: UUID, clerk_user_id: str) -> Habit | None:
    user_id = await _get_user_id(db, clerk_user_id)
    result  = await db.execute(
        select(Habit).where(and_(Habit.id == habit_id, Habit.user_id == user_id))
    )
    return result.scalar_one_or_none()


async def list_habits(
    db: AsyncSession, clerk_user_id: str, *, active_only: bool = True
) -> list[Habit]:
    user_id = await _get_user_id(db, clerk_user_id)
    conditions = [Habit.user_id == user_id]
    if active_only:
        conditions.append(Habit.is_active == True)  # noqa: E712
    result = await db.execute(
        select(Habit).where(and_(*conditions)).order_by(Habit.created_at.asc())
    )
    return list(result.scalars().all())


async def update_habit(db: AsyncSession, habit: Habit, payload: HabitUpdate) -> Habit:
    data = payload.model_dump(exclude_unset=True)
    for field, value in data.items():
        if field == "frequency" and value is not None:
            setattr(habit, field, HabitFrequency(value))
        else:
            setattr(habit, field, value)
    habit.updated_at = datetime.now(timezone.utc)
    await db.flush()
    return habit


async def delete_habit(db: AsyncSession, habit: Habit) -> None:
    await db.delete(habit)
    await db.flush()


# ── Logging ────────────────────────────────────────────────────────────────────

async def log_habit(
    db: AsyncSession, habit: Habit, clerk_user_id: str, payload: HabitLogCreate
) -> HabitLog:
    user_id = await _get_user_id(db, clerk_user_id)
    # Check for duplicate
    existing = await db.execute(
        select(HabitLog).where(
            and_(HabitLog.habit_id == habit.id, HabitLog.logged_date == payload.logged_date)
        )
    )
    if existing.scalar_one_or_none():
        raise ValueError("Habit already logged for this date")
    log = HabitLog(
        habit_id=habit.id,
        user_id=user_id,
        logged_date=payload.logged_date,
        note=payload.note,
    )
    db.add(log)
    await db.flush()
    return log


async def unlog_habit(db: AsyncSession, habit: Habit, log_date: date) -> None:
    """Remove a log entry (un-complete a habit for a date)."""
    result = await db.execute(
        select(HabitLog).where(
            and_(HabitLog.habit_id == habit.id, HabitLog.logged_date == log_date)
        )
    )
    log = result.scalar_one_or_none()
    if log:
        await db.delete(log)
        await db.flush()


async def get_logs_for_habit(
    db: AsyncSession, habit_id: UUID, *, days: int = 90
) -> list[HabitLog]:
    since = date.today() - timedelta(days=days)
    result = await db.execute(
        select(HabitLog)
        .where(and_(HabitLog.habit_id == habit_id, HabitLog.logged_date >= since))
        .order_by(desc(HabitLog.logged_date))
    )
    return list(result.scalars().all())


# ── Streak calculation ─────────────────────────────────────────────────────────

def calculate_streak(logged_dates: list[date]) -> tuple[int, int]:
    """
    Return (current_streak, longest_streak) from a sorted list of logged dates.

    current_streak: consecutive days ending today or yesterday.
    longest_streak: all-time best consecutive run.
    """
    if not logged_dates:
        return 0, 0

    sorted_dates = sorted(set(logged_dates), reverse=True)
    today        = date.today()

    # Current streak
    current = 0
    check   = today
    for d in sorted_dates:
        if d == check:
            current += 1
            check = check - timedelta(days=1)
        elif d == today - timedelta(days=1) and current == 0:
            # Allow yesterday as start
            current = 1
            check   = d - timedelta(days=1)
        else:
            break

    # Longest streak
    longest = 1
    run     = 1
    asc     = sorted(set(logged_dates))
    for i in range(1, len(asc)):
        if (asc[i] - asc[i - 1]).days == 1:
            run += 1
            longest = max(longest, run)
        else:
            run = 1

    return current, max(longest, current)


async def enrich_habit(db: AsyncSession, habit: Habit) -> HabitRead:
    """Attach streak and completion stats to a HabitRead response."""
    logs = await get_logs_for_habit(db, habit.id, days=365)
    logged_dates = [l.logged_date for l in logs]
    current_streak, longest_streak = calculate_streak(logged_dates)

    today       = date.today()
    week_start  = today - timedelta(days=today.weekday())
    week_logs   = sum(1 for d in logged_dates if d >= week_start)
    logged_today = today in set(logged_dates)

    read = HabitRead.model_validate(habit)
    read.current_streak       = current_streak
    read.longest_streak       = longest_streak
    read.completions_this_week = week_logs
    read.logged_today          = logged_today
    return read
