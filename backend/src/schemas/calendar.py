"""
Pydantic schemas for the Calendar endpoints.

EventCreate  — POST /events
EventUpdate  — PATCH /events/{id}
EventRead    — all responses
EventListResponse — paginated list
"""
from __future__ import annotations
from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field, model_validator


class RecurrenceRule(BaseModel):
    frequency: str = Field(..., pattern="^(daily|weekly|monthly|yearly)$")
    interval:  int = Field(1, ge=1, le=365)
    until:     Optional[datetime] = None
    count:     Optional[int]      = Field(None, ge=1, le=999)


class EventBase(BaseModel):
    title:       str            = Field(..., min_length=1, max_length=500)
    description: Optional[str] = Field(None, max_length=5000)
    start_at:    datetime
    end_at:      datetime
    all_day:     bool           = False
    color_tag:   Optional[str] = Field(None, max_length=30)
    location:    Optional[str] = Field(None, max_length=300)
    recurrence:  Optional[RecurrenceRule] = None

    @model_validator(mode="after")
    def end_after_start(self) -> "EventBase":
        if not self.all_day and self.end_at <= self.start_at:
            raise ValueError("end_at must be after start_at")
        return self


class EventCreate(EventBase):
    pass


class EventUpdate(BaseModel):
    title:       Optional[str]            = Field(None, min_length=1, max_length=500)
    description: Optional[str]            = Field(None, max_length=5000)
    start_at:    Optional[datetime]       = None
    end_at:      Optional[datetime]       = None
    all_day:     Optional[bool]           = None
    color_tag:   Optional[str]            = Field(None, max_length=30)
    location:    Optional[str]            = Field(None, max_length=300)
    recurrence:  Optional[RecurrenceRule] = None


class EventRead(BaseModel):
    id:          UUID
    user_id:     UUID
    title:       str
    description: Optional[str]
    start_at:    datetime
    end_at:      datetime
    all_day:     bool
    color_tag:   Optional[str]
    location:    Optional[str]
    recurrence:  Optional[RecurrenceRule]
    created_at:  datetime
    updated_at:  datetime

    model_config = {"from_attributes": True}


class EventListResponse(BaseModel):
    items:     list[EventRead]
    total:     int
    page:      int
    page_size: int
    has_more:  bool
