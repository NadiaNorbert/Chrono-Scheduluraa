"""
Calendar API — /api/v1/events

GET    /events          List events (with date range)
POST   /events          Create event
GET    /events/{id}     Get single event
PATCH  /events/{id}     Update event
DELETE /events/{id}     Delete event
"""
from datetime import datetime
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.dependencies import get_db, get_current_user
from src.schemas.calendar import EventCreate, EventUpdate, EventRead, EventListResponse
from src.services.calendar_service import (
    create_event, get_event, list_events, update_event, delete_event,
)
from src.core.logging import get_logger

router = APIRouter()
logger = get_logger(__name__)


def _not_found(event_id: UUID) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail={"detail": f"Event {event_id} not found", "code": "EVENT_NOT_FOUND"},
    )


@router.get("", response_model=EventListResponse)
async def list_events_endpoint(
    start:     Optional[datetime] = Query(None),
    end:       Optional[datetime] = Query(None),
    page:      int = Query(1, ge=1),
    page_size: int = Query(200, ge=1, le=500),
    clerk_user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> EventListResponse:
    try:
        items, total = await list_events(
            db, clerk_user_id, start=start, end=end, page=page, page_size=page_size
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail={"detail": str(e), "code": "USER_NOT_FOUND"})
    return EventListResponse(
        items=[EventRead.model_validate(e) for e in items],
        total=total, page=page, page_size=page_size,
        has_more=(page * page_size) < total,
    )


@router.post("", response_model=EventRead, status_code=201)
async def create_event_endpoint(
    payload: EventCreate,
    clerk_user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> EventRead:
    try:
        event = await create_event(db, clerk_user_id, payload)
    except ValueError as e:
        raise HTTPException(status_code=404, detail={"detail": str(e), "code": "USER_NOT_FOUND"})
    return EventRead.model_validate(event)


@router.get("/{event_id}", response_model=EventRead)
async def get_event_endpoint(
    event_id: UUID,
    clerk_user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> EventRead:
    event = await get_event(db, event_id, clerk_user_id)
    if not event:
        raise _not_found(event_id)
    return EventRead.model_validate(event)


@router.patch("/{event_id}", response_model=EventRead)
async def update_event_endpoint(
    event_id: UUID,
    payload: EventUpdate,
    clerk_user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> EventRead:
    event = await get_event(db, event_id, clerk_user_id)
    if not event:
        raise _not_found(event_id)
    updated = await update_event(db, event, payload)
    return EventRead.model_validate(updated)


@router.delete("/{event_id}", status_code=204)
async def delete_event_endpoint(
    event_id: UUID,
    clerk_user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    event = await get_event(db, event_id, clerk_user_id)
    if not event:
        raise _not_found(event_id)
    await delete_event(db, event)
