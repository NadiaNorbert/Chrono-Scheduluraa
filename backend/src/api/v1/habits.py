"""
Habits API — /api/v1/habits

GET    /habits                List habits
POST   /habits                Create habit
GET    /habits/{id}           Get habit (with streaks)
PATCH  /habits/{id}           Update habit
DELETE /habits/{id}           Delete habit
POST   /habits/{id}/log       Log completion
DELETE /habits/{id}/log/{date} Remove a log entry
GET    /habits/{id}/logs      Get log history
"""
from datetime import date
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.dependencies import get_db, get_current_user
from src.schemas.habits import (
    HabitCreate, HabitUpdate, HabitRead,
    HabitLogCreate, HabitLogRead, HabitListResponse,
)
from src.services.habits_service import (
    create_habit, get_habit, list_habits, update_habit, delete_habit,
    log_habit, unlog_habit, get_logs_for_habit, enrich_habit,
)
from src.core.logging import get_logger

router = APIRouter()
logger = get_logger(__name__)


def _not_found(habit_id: UUID) -> HTTPException:
    return HTTPException(
        status_code=404,
        detail={"detail": f"Habit {habit_id} not found", "code": "HABIT_NOT_FOUND"},
    )


@router.get("", response_model=HabitListResponse)
async def list_habits_endpoint(
    active_only: bool = Query(True),
    clerk_user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> HabitListResponse:
    try:
        habits = await list_habits(db, clerk_user_id, active_only=active_only)
    except ValueError as e:
        raise HTTPException(404, detail={"detail": str(e), "code": "USER_NOT_FOUND"})
    enriched = [await enrich_habit(db, h) for h in habits]
    return HabitListResponse(items=enriched, total=len(enriched))


@router.post("", response_model=HabitRead, status_code=201)
async def create_habit_endpoint(
    payload: HabitCreate,
    clerk_user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> HabitRead:
    try:
        habit = await create_habit(db, clerk_user_id, payload)
    except ValueError as e:
        raise HTTPException(404, detail={"detail": str(e), "code": "USER_NOT_FOUND"})
    return await enrich_habit(db, habit)


@router.get("/{habit_id}", response_model=HabitRead)
async def get_habit_endpoint(
    habit_id: UUID,
    clerk_user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> HabitRead:
    habit = await get_habit(db, habit_id, clerk_user_id)
    if not habit:
        raise _not_found(habit_id)
    return await enrich_habit(db, habit)


@router.patch("/{habit_id}", response_model=HabitRead)
async def update_habit_endpoint(
    habit_id: UUID,
    payload: HabitUpdate,
    clerk_user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> HabitRead:
    habit = await get_habit(db, habit_id, clerk_user_id)
    if not habit:
        raise _not_found(habit_id)
    updated = await update_habit(db, habit, payload)
    return await enrich_habit(db, updated)


@router.delete("/{habit_id}", status_code=204)
async def delete_habit_endpoint(
    habit_id: UUID,
    clerk_user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    habit = await get_habit(db, habit_id, clerk_user_id)
    if not habit:
        raise _not_found(habit_id)
    await delete_habit(db, habit)


@router.post("/{habit_id}/log", response_model=HabitLogRead, status_code=201)
async def log_habit_endpoint(
    habit_id: UUID,
    payload: HabitLogCreate,
    clerk_user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> HabitLogRead:
    habit = await get_habit(db, habit_id, clerk_user_id)
    if not habit:
        raise _not_found(habit_id)
    try:
        log = await log_habit(db, habit, clerk_user_id, payload)
    except ValueError as e:
        raise HTTPException(409, detail={"detail": str(e), "code": "ALREADY_LOGGED"})
    return HabitLogRead.model_validate(log)


@router.delete("/{habit_id}/log/{log_date}", status_code=204)
async def unlog_habit_endpoint(
    habit_id: UUID,
    log_date: date,
    clerk_user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    habit = await get_habit(db, habit_id, clerk_user_id)
    if not habit:
        raise _not_found(habit_id)
    await unlog_habit(db, habit, log_date)


@router.get("/{habit_id}/logs", response_model=list[HabitLogRead])
async def get_habit_logs_endpoint(
    habit_id: UUID,
    days: int = Query(90, ge=1, le=365),
    clerk_user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[HabitLogRead]:
    habit = await get_habit(db, habit_id, clerk_user_id)
    if not habit:
        raise _not_found(habit_id)
    logs = await get_logs_for_habit(db, habit_id, days=days)
    return [HabitLogRead.model_validate(l) for l in logs]
