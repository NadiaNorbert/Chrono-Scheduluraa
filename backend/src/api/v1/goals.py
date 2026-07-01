"""
Goals API — /api/v1/goals

GET    /goals                          List goals
POST   /goals                          Create goal (with milestones)
GET    /goals/{id}                     Get goal
PATCH  /goals/{id}                     Update goal
DELETE /goals/{id}                     Delete goal
POST   /goals/{id}/milestones          Add milestone
PATCH  /goals/{id}/milestones/{ms_id}  Update milestone
DELETE /goals/{id}/milestones/{ms_id}  Delete milestone
"""
from uuid import UUID
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from src.core.dependencies import get_db, get_current_user
from src.schemas.goals import (
    GoalCreate, GoalUpdate, GoalRead, GoalListResponse,
    MilestoneCreate, MilestoneUpdate, MilestoneRead,
)
from src.services.goals_service import (
    create_goal, get_goal, list_goals, update_goal, delete_goal,
    add_milestone, update_milestone, delete_milestone,
)
from src.db.models.goal import Milestone
from src.core.logging import get_logger

router = APIRouter()
logger = get_logger(__name__)


def _not_found(label: str, uid: UUID) -> HTTPException:
    return HTTPException(
        404, detail={"detail": f"{label} {uid} not found", "code": f"{label.upper()}_NOT_FOUND"}
    )


@router.get("", response_model=GoalListResponse)
async def list_goals_endpoint(
    status: Optional[str] = Query(None, pattern="^(active|completed|paused|abandoned)$"),
    clerk_user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> GoalListResponse:
    try:
        goals = await list_goals(db, clerk_user_id, status=status)
    except ValueError as e:
        raise HTTPException(404, detail={"detail": str(e), "code": "USER_NOT_FOUND"})
    items = [GoalRead.model_validate(g) for g in goals]
    return GoalListResponse(items=items, total=len(items))


@router.post("", response_model=GoalRead, status_code=201)
async def create_goal_endpoint(
    payload: GoalCreate,
    clerk_user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> GoalRead:
    try:
        goal = await create_goal(db, clerk_user_id, payload)
    except ValueError as e:
        raise HTTPException(404, detail={"detail": str(e), "code": "USER_NOT_FOUND"})
    return GoalRead.model_validate(goal)


@router.get("/{goal_id}", response_model=GoalRead)
async def get_goal_endpoint(
    goal_id: UUID,
    clerk_user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> GoalRead:
    goal = await get_goal(db, goal_id, clerk_user_id)
    if not goal:
        raise _not_found("Goal", goal_id)
    return GoalRead.model_validate(goal)


@router.patch("/{goal_id}", response_model=GoalRead)
async def update_goal_endpoint(
    goal_id: UUID,
    payload: GoalUpdate,
    clerk_user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> GoalRead:
    goal = await get_goal(db, goal_id, clerk_user_id)
    if not goal:
        raise _not_found("Goal", goal_id)
    updated = await update_goal(db, goal, payload)
    return GoalRead.model_validate(updated)


@router.delete("/{goal_id}", status_code=204)
async def delete_goal_endpoint(
    goal_id: UUID,
    clerk_user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    goal = await get_goal(db, goal_id, clerk_user_id)
    if not goal:
        raise _not_found("Goal", goal_id)
    await delete_goal(db, goal)


@router.post("/{goal_id}/milestones", response_model=GoalRead, status_code=201)
async def add_milestone_endpoint(
    goal_id: UUID,
    payload: MilestoneCreate,
    clerk_user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> GoalRead:
    goal = await get_goal(db, goal_id, clerk_user_id)
    if not goal:
        raise _not_found("Goal", goal_id)
    updated = await add_milestone(db, goal, clerk_user_id, payload)
    return GoalRead.model_validate(updated)


@router.patch("/{goal_id}/milestones/{ms_id}", response_model=GoalRead)
async def update_milestone_endpoint(
    goal_id: UUID,
    ms_id:   UUID,
    payload: MilestoneUpdate,
    clerk_user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> GoalRead:
    goal = await get_goal(db, goal_id, clerk_user_id)
    if not goal:
        raise _not_found("Goal", goal_id)
    ms_result = await db.execute(
        select(Milestone).where(and_(Milestone.id == ms_id, Milestone.goal_id == goal_id))
    )
    ms = ms_result.scalar_one_or_none()
    if not ms:
        raise _not_found("Milestone", ms_id)
    updated = await update_milestone(db, ms, goal, payload)
    return GoalRead.model_validate(updated)


@router.delete("/{goal_id}/milestones/{ms_id}", response_model=GoalRead)
async def delete_milestone_endpoint(
    goal_id: UUID,
    ms_id:   UUID,
    clerk_user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> GoalRead:
    goal = await get_goal(db, goal_id, clerk_user_id)
    if not goal:
        raise _not_found("Goal", goal_id)
    ms_result = await db.execute(
        select(Milestone).where(and_(Milestone.id == ms_id, Milestone.goal_id == goal_id))
    )
    ms = ms_result.scalar_one_or_none()
    if not ms:
        raise _not_found("Milestone", ms_id)
    updated = await delete_milestone(db, ms, goal)
    return GoalRead.model_validate(updated)
