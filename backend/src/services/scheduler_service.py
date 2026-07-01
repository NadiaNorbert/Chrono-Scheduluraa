"""
Task service — all database operations for the Tasks module.

All route handlers delegate to these functions. No raw SQL in routes.
"""

from __future__ import annotations
from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from sqlalchemy import select, func, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.models.task import Task, Priority
from src.db.models.user import User
from src.schemas.scheduler import TaskCreate, TaskUpdate
from src.core.logging import get_logger

logger = get_logger(__name__)


# ── Helpers ────────────────────────────────────────────────────────────────────

async def _get_user_id(db: AsyncSession, clerk_user_id: str) -> UUID:
    """Resolve a Clerk user ID to the internal user UUID. Raises ValueError if not found."""
    result = await db.execute(select(User.id).where(User.clerk_user_id == clerk_user_id))
    uid = result.scalar_one_or_none()
    if uid is None:
        raise ValueError(f"User not found for clerk_user_id={clerk_user_id}")
    return uid


# ── CRUD ───────────────────────────────────────────────────────────────────────

async def create_task(
    db: AsyncSession,
    clerk_user_id: str,
    payload: TaskCreate,
) -> Task:
    """Create a new task for the authenticated user."""
    user_id = await _get_user_id(db, clerk_user_id)
    task = Task(
        user_id=user_id,
        title=payload.title,
        description=payload.description,
        priority=Priority(payload.priority),
        due_at=payload.due_at,
        estimated_minutes=payload.estimated_minutes,
        tags=payload.tags,
    )
    db.add(task)
    await db.flush()
    logger.info("Task created id=%s user_id=%s", task.id, user_id)
    return task


async def get_task(
    db: AsyncSession,
    task_id: UUID,
    clerk_user_id: str,
) -> Task | None:
    """Fetch a single task by ID, enforcing ownership."""
    user_id = await _get_user_id(db, clerk_user_id)
    result = await db.execute(
        select(Task).where(and_(Task.id == task_id, Task.user_id == user_id))
    )
    return result.scalar_one_or_none()


async def list_tasks(
    db: AsyncSession,
    clerk_user_id: str,
    *,
    filter_by: Optional[str] = None,   # "today" | "upcoming" | "completed" | "all"
    priority: Optional[str] = None,
    search: Optional[str] = None,
    page: int = 1,
    page_size: int = 50,
) -> tuple[list[Task], int]:
    """
    List tasks for the authenticated user with optional filtering.

    Returns a tuple of (items, total_count).
    """
    user_id = await _get_user_id(db, clerk_user_id)
    now = datetime.now(timezone.utc)

    conditions = [Task.user_id == user_id]

    # Filter presets
    if filter_by == "today":
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        today_end   = now.replace(hour=23, minute=59, second=59, microsecond=999999)
        conditions.append(Task.due_at.between(today_start, today_end))
        conditions.append(Task.completed_at.is_(None))
    elif filter_by == "upcoming":
        conditions.append(Task.due_at > now)
        conditions.append(Task.completed_at.is_(None))
    elif filter_by == "completed":
        conditions.append(Task.completed_at.isnot(None))
    elif filter_by == "overdue":
        conditions.append(Task.due_at < now)
        conditions.append(Task.completed_at.is_(None))
    else:
        # "all" — no extra filter, but exclude completed by default
        conditions.append(Task.completed_at.is_(None))

    # Priority filter
    if priority and priority in {"high", "medium", "low"}:
        conditions.append(Task.priority == Priority(priority))

    # Search (title / description)
    if search:
        term = f"%{search.lower()}%"
        conditions.append(
            or_(
                func.lower(Task.title).like(term),
                func.lower(Task.description).like(term),
            )
        )

    base_query = select(Task).where(and_(*conditions))

    # Total count
    count_result = await db.execute(select(func.count()).select_from(base_query.subquery()))
    total = count_result.scalar_one()

    # Paginated results, ordered by priority then due_at
    offset = (page - 1) * page_size
    priority_order = func.array_position(
        ["high", "medium", "low"],   # type: ignore[list-item]
        Task.priority.cast(type_=None),
    )
    result = await db.execute(
        base_query
        .order_by(priority_order, Task.due_at.asc().nulls_last(), Task.created_at.desc())
        .offset(offset)
        .limit(page_size)
    )
    tasks = list(result.scalars().all())
    return tasks, total


async def update_task(
    db: AsyncSession,
    task: Task,
    payload: TaskUpdate,
) -> Task:
    """Apply a partial update to a task."""
    data = payload.model_dump(exclude_unset=True)

    for field, value in data.items():
        if field == "priority" and value is not None:
            setattr(task, field, Priority(value))
        else:
            setattr(task, field, value)

    task.updated_at = datetime.now(timezone.utc)
    await db.flush()
    logger.info("Task updated id=%s fields=%s", task.id, list(data.keys()))
    return task


async def delete_task(db: AsyncSession, task: Task) -> None:
    """Hard-delete a task."""
    await db.delete(task)
    await db.flush()
    logger.info("Task deleted id=%s", task.id)


async def toggle_task_complete(db: AsyncSession, task: Task) -> Task:
    """Toggle a task between complete and incomplete."""
    if task.completed_at is None:
        task.completed_at = datetime.now(timezone.utc)
    else:
        task.completed_at = None
    task.updated_at = datetime.now(timezone.utc)
    await db.flush()
    return task
