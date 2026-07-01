"""
Calendar service — all database operations for CalendarEvents.
"""
from __future__ import annotations
from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.models.event import CalendarEvent
from src.db.models.user import User
from src.schemas.calendar import EventCreate, EventUpdate
from src.core.logging import get_logger

logger = get_logger(__name__)


async def _get_user_id(db: AsyncSession, clerk_user_id: str) -> UUID:
    result = await db.execute(select(User.id).where(User.clerk_user_id == clerk_user_id))
    uid = result.scalar_one_or_none()
    if uid is None:
        raise ValueError(f"User not found: {clerk_user_id}")
    return uid


async def create_event(db: AsyncSession, clerk_user_id: str, payload: EventCreate) -> CalendarEvent:
    user_id = await _get_user_id(db, clerk_user_id)
    recurrence_dict = payload.recurrence.model_dump() if payload.recurrence else None
    event = CalendarEvent(
        user_id=user_id,
        title=payload.title,
        description=payload.description,
        start_at=payload.start_at,
        end_at=payload.end_at,
        all_day=payload.all_day,
        color_tag=payload.color_tag,
        location=payload.location,
        recurrence=recurrence_dict,
    )
    db.add(event)
    await db.flush()
    logger.info("CalendarEvent created id=%s", event.id)
    return event


async def get_event(db: AsyncSession, event_id: UUID, clerk_user_id: str) -> CalendarEvent | None:
    user_id = await _get_user_id(db, clerk_user_id)
    result = await db.execute(
        select(CalendarEvent).where(
            and_(CalendarEvent.id == event_id, CalendarEvent.user_id == user_id)
        )
    )
    return result.scalar_one_or_none()


async def list_events(
    db: AsyncSession,
    clerk_user_id: str,
    *,
    start: datetime | None = None,
    end: datetime | None = None,
    page: int = 1,
    page_size: int = 200,
) -> tuple[list[CalendarEvent], int]:
    user_id = await _get_user_id(db, clerk_user_id)
    conditions = [CalendarEvent.user_id == user_id]
    if start:
        conditions.append(CalendarEvent.end_at >= start)
    if end:
        conditions.append(CalendarEvent.start_at <= end)

    base_q = select(CalendarEvent).where(and_(*conditions))
    count_result = await db.execute(select(func.count()).select_from(base_q.subquery()))
    total = count_result.scalar_one()

    result = await db.execute(
        base_q.order_by(CalendarEvent.start_at.asc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    return list(result.scalars().all()), total


async def update_event(db: AsyncSession, event: CalendarEvent, payload: EventUpdate) -> CalendarEvent:
    data = payload.model_dump(exclude_unset=True)
    for field, value in data.items():
        if field == "recurrence" and value is not None:
            setattr(event, field, value.model_dump() if hasattr(value, "model_dump") else value)
        else:
            setattr(event, field, value)
    event.updated_at = datetime.now(timezone.utc)
    await db.flush()
    return event


async def delete_event(db: AsyncSession, event: CalendarEvent) -> None:
    await db.delete(event)
    await db.flush()
    logger.info("CalendarEvent deleted id=%s", event.id)
