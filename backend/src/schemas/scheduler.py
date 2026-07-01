"""
Pydantic schemas for the Tasks / Scheduler endpoints.

TaskCreate  — request body for POST /tasks
TaskUpdate  — request body for PATCH /tasks/{id}
TaskRead    — response schema for all task endpoints
TaskListResponse — paginated list response
"""

from __future__ import annotations
from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field, field_validator


# ── Shared ────────────────────────────────────────────────────────────────────

VALID_PRIORITIES = {"high", "medium", "low"}


class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=500, description="Task title")
    description: Optional[str] = Field(None, max_length=5000)
    priority: str = Field("medium", description="high | medium | low")
    due_at: Optional[datetime] = Field(None, description="Deadline (UTC ISO 8601)")
    estimated_minutes: Optional[int] = Field(None, ge=1, le=1440, description="Time estimate in minutes")
    tags: list[str] = Field(default_factory=list, description="List of tag strings")

    @field_validator("priority")
    @classmethod
    def validate_priority(cls, v: str) -> str:
        if v not in VALID_PRIORITIES:
            raise ValueError(f"priority must be one of {VALID_PRIORITIES}")
        return v

    @field_validator("tags")
    @classmethod
    def validate_tags(cls, v: list[str]) -> list[str]:
        if len(v) > 10:
            raise ValueError("Maximum 10 tags per task")
        return [t.strip().lower()[:50] for t in v if t.strip()]


# ── Request schemas ────────────────────────────────────────────────────────────

class TaskCreate(TaskBase):
    """Request body for creating a new task."""
    pass


class TaskUpdate(BaseModel):
    """Request body for partially updating a task. All fields optional."""
    title: Optional[str] = Field(None, min_length=1, max_length=500)
    description: Optional[str] = Field(None, max_length=5000)
    priority: Optional[str] = None
    due_at: Optional[datetime] = None
    estimated_minutes: Optional[int] = Field(None, ge=1, le=1440)
    completed_at: Optional[datetime] = None
    tags: Optional[list[str]] = None

    @field_validator("priority")
    @classmethod
    def validate_priority(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in VALID_PRIORITIES:
            raise ValueError(f"priority must be one of {VALID_PRIORITIES}")
        return v

    @field_validator("tags")
    @classmethod
    def validate_tags(cls, v: Optional[list[str]]) -> Optional[list[str]]:
        if v is None:
            return v
        if len(v) > 10:
            raise ValueError("Maximum 10 tags per task")
        return [t.strip().lower()[:50] for t in v if t.strip()]


# ── Response schemas ───────────────────────────────────────────────────────────

class TaskRead(BaseModel):
    """Full task representation returned by API responses."""
    id: UUID
    user_id: UUID
    title: str
    description: Optional[str]
    priority: str
    due_at: Optional[datetime]
    estimated_minutes: Optional[int]
    completed_at: Optional[datetime]
    tags: list[str]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class TaskListResponse(BaseModel):
    """Paginated task list response envelope."""
    items: list[TaskRead]
    total: int
    page: int
    page_size: int
    has_more: bool
