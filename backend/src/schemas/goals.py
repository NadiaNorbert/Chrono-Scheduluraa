"""Pydantic schemas for the Goals endpoints."""
from __future__ import annotations
from datetime import datetime, date
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field


class MilestoneCreate(BaseModel):
    title:       str            = Field(..., min_length=1, max_length=300)
    due_date:    Optional[date] = None
    order_index: int            = 0


class MilestoneUpdate(BaseModel):
    title:       Optional[str]  = Field(None, min_length=1, max_length=300)
    is_done:     Optional[bool] = None
    due_date:    Optional[date] = None
    order_index: Optional[int]  = None


class MilestoneRead(BaseModel):
    id:          UUID
    goal_id:     UUID
    user_id:     UUID
    title:       str
    is_done:     bool
    due_date:    Optional[date]
    order_index: int
    created_at:  datetime

    model_config = {"from_attributes": True}


class GoalCreate(BaseModel):
    title:       str                    = Field(..., min_length=1, max_length=300)
    description: Optional[str]         = Field(None, max_length=5000)
    status:      str                    = Field("active", pattern="^(active|completed|paused|abandoned)$")
    target_date: Optional[date]        = None
    color:       Optional[str]         = Field(None, max_length=30)
    icon:        Optional[str]         = Field(None, max_length=10)
    milestones:  list[MilestoneCreate] = Field(default_factory=list)


class GoalUpdate(BaseModel):
    title:       Optional[str]  = Field(None, min_length=1, max_length=300)
    description: Optional[str]  = Field(None, max_length=5000)
    status:      Optional[str]  = Field(None, pattern="^(active|completed|paused|abandoned)$")
    target_date: Optional[date] = None
    color:       Optional[str]  = Field(None, max_length=30)
    icon:        Optional[str]  = Field(None, max_length=10)
    progress:    Optional[int]  = Field(None, ge=0, le=100)


class GoalRead(BaseModel):
    id:          UUID
    user_id:     UUID
    title:       str
    description: Optional[str]
    status:      str
    target_date: Optional[date]
    color:       Optional[str]
    icon:        Optional[str]
    progress:    int
    created_at:  datetime
    updated_at:  datetime
    milestones:  list[MilestoneRead] = []

    model_config = {"from_attributes": True}


class GoalListResponse(BaseModel):
    items: list[GoalRead]
    total: int
