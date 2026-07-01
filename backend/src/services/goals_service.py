"""Goals service — CRUD for Goals and Milestones."""
from __future__ import annotations
from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.models.goal import Goal, Milestone, GoalStatus
from src.db.models.user import User
from src.schemas.goals import GoalCreate, GoalUpdate, MilestoneCreate, MilestoneUpdate
from src.core.logging import get_logger

logger = get_logger(__name__)


async def _get_user_id(db: AsyncSession, clerk_user_id: str) -> UUID:
    result = await db.execute(select(User.id).where(User.clerk_user_id == clerk_user_id))
    uid = result.scalar_one_or_none()
    if uid is None:
        raise ValueError(f"User not found: {clerk_user_id}")
    return uid


def _compute_progress(milestones: list[Milestone]) -> int:
    """Auto-compute progress % from milestones. Returns 0 if no milestones."""
    if not milestones:
        return 0
    done = sum(1 for m in milestones if m.is_done)
    return round(done / len(milestones) * 100)


async def create_goal(db: AsyncSession, clerk_user_id: str, payload: GoalCreate) -> Goal:
    user_id = await _get_user_id(db, clerk_user_id)
    goal = Goal(
        user_id=user_id,
        title=payload.title,
        description=payload.description,
        status=GoalStatus(payload.status),
        target_date=payload.target_date,
        color=payload.color,
        icon=payload.icon,
        progress=0,
    )
    db.add(goal)
    await db.flush()

    for i, ms in enumerate(payload.milestones):
        milestone = Milestone(
            goal_id=goal.id, user_id=user_id,
            title=ms.title, due_date=ms.due_date, order_index=i,
        )
        db.add(milestone)

    await db.flush()
    logger.info("Goal created id=%s", goal.id)
    return await _load_goal(db, goal.id)


async def _load_goal(db: AsyncSession, goal_id: UUID) -> Goal:
    result = await db.execute(
        select(Goal)
        .options(selectinload(Goal.milestones))
        .where(Goal.id == goal_id)
    )
    return result.scalar_one()


async def get_goal(db: AsyncSession, goal_id: UUID, clerk_user_id: str) -> Goal | None:
    user_id = await _get_user_id(db, clerk_user_id)
    result  = await db.execute(
        select(Goal)
        .options(selectinload(Goal.milestones))
        .where(and_(Goal.id == goal_id, Goal.user_id == user_id))
    )
    return result.scalar_one_or_none()


async def list_goals(
    db: AsyncSession, clerk_user_id: str, *, status: str | None = None
) -> list[Goal]:
    user_id    = await _get_user_id(db, clerk_user_id)
    conditions = [Goal.user_id == user_id]
    if status:
        conditions.append(Goal.status == GoalStatus(status))
    result = await db.execute(
        select(Goal)
        .options(selectinload(Goal.milestones))
        .where(and_(*conditions))
        .order_by(Goal.created_at.desc())
    )
    return list(result.scalars().all())


async def update_goal(db: AsyncSession, goal: Goal, payload: GoalUpdate) -> Goal:
    data = payload.model_dump(exclude_unset=True)
    for field, value in data.items():
        if field == "status" and value is not None:
            setattr(goal, field, GoalStatus(value))
        else:
            setattr(goal, field, value)
    # Auto-update progress if milestones exist and progress not manually set
    if "progress" not in data and goal.milestones:
        goal.progress = _compute_progress(list(goal.milestones))
    goal.updated_at = datetime.now(timezone.utc)
    await db.flush()
    return await _load_goal(db, goal.id)


async def delete_goal(db: AsyncSession, goal: Goal) -> None:
    await db.delete(goal)
    await db.flush()


# ── Milestones ─────────────────────────────────────────────────────────────

async def add_milestone(
    db: AsyncSession, goal: Goal, clerk_user_id: str, payload: MilestoneCreate
) -> Goal:
    user_id = await _get_user_id(db, clerk_user_id)
    ms = Milestone(
        goal_id=goal.id, user_id=user_id,
        title=payload.title, due_date=payload.due_date,
        order_index=payload.order_index,
    )
    db.add(ms)
    await db.flush()
    return await _load_goal(db, goal.id)


async def update_milestone(
    db: AsyncSession, milestone: Milestone, goal: Goal, payload: MilestoneUpdate
) -> Goal:
    data = payload.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(milestone, field, value)
    await db.flush()
    # Recompute goal progress
    updated_goal = await _load_goal(db, goal.id)
    updated_goal.progress = _compute_progress(list(updated_goal.milestones))
    updated_goal.updated_at = datetime.now(timezone.utc)
    await db.flush()
    return updated_goal


async def delete_milestone(db: AsyncSession, milestone: Milestone, goal: Goal) -> Goal:
    await db.delete(milestone)
    await db.flush()
    updated_goal = await _load_goal(db, goal.id)
    updated_goal.progress = _compute_progress(list(updated_goal.milestones))
    await db.flush()
    return updated_goal
