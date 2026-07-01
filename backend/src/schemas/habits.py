"""Pydantic schemas for the Habits endpoints."""
from __future__ import annotations
from datetime import datetime, date
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field, field_validator


class HabitBase(BaseModel):
    title:       str            = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    frequency:   str            = Field("daily", pattern="^(daily|weekly|monthly)$")
    target_days: list[int]      = Field(default_factory=list)
    color:       Optional[str] = Field(None, max_length=30)
    icon:        Optional[str] = Field(None, max_length=10)

    @field_validator("target_days")
    @classmethod
    def validate_days(cls, v: list[int]) -> list[int]:
        for d in v:
            if d < 0 or d > 6:
                raise ValueError("target_days values must be 0–6 (Mon–Sun)")
        return sorted(set(v))


class HabitCreate(HabitBase):
    pass


class HabitUpdate(BaseModel):
    title:       Optional[str]       = Field(None, min_length=1, max_length=200)
    description: Optional[str]       = Field(None, max_length=2000)
    frequency:   Optional[str]       = Field(None, pattern="^(daily|weekly|monthly)$")
    target_days: Optional[list[int]] = None
    color:       Optional[str]       = Field(None, max_length=30)
    icon:        Optional[str]       = Field(None, max_length=10)
    is_active:   Optional[bool]      = None


class HabitRead(BaseModel):
    id:          UUID
    user_id:     UUID
    title:       str
    description: Optional[str]
    frequency:   str
    target_days: list[int]
    color:       Optional[str]
    icon:        Optional[str]
    is_active:   bool
    created_at:  datetime
    updated_at:  datetime
    # Computed fields injected by the service
    current_streak: int = 0
    longest_streak: int = 0
    completions_this_week: int = 0
    logged_today: bool = False

    model_config = {"from_attributes": True}


class HabitLogCreate(BaseModel):
    logged_date: date
    note:        Optional[str] = Field(None, max_length=500)


class HabitLogRead(BaseModel):
    id:          UUID
    habit_id:    UUID
    user_id:     UUID
    logged_date: date
    note:        Optional[str]
    created_at:  datetime

    model_config = {"from_attributes": True}


class HabitListResponse(BaseModel):
    items: list[HabitRead]
    total: int
