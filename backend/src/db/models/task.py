"""Task ORM model — represents a user's actionable work item."""

import uuid
from datetime import datetime, timezone
from sqlalchemy import String, DateTime, Integer, Boolean, ForeignKey, Text, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum

from src.db.base import Base


class Priority(str, enum.Enum):
    HIGH   = "high"
    MEDIUM = "medium"
    LOW    = "low"


class Task(Base):
    """
    A single actionable task belonging to a user.

    Attributes:
        id:                 UUID primary key.
        user_id:            FK → users.id (cascade delete).
        title:              Task title (max 500 chars).
        description:        Optional rich-text description.
        priority:           high | medium | low (default: medium).
        due_at:             Optional deadline (UTC).
        estimated_minutes:  Optional time estimate in minutes.
        completed_at:       Set when the task is marked complete.
        tags:               PostgreSQL text array of tag strings.
        created_at:         Creation timestamp (UTC).
        updated_at:         Last-updated timestamp (UTC).
    """

    __tablename__ = "tasks"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    priority: Mapped[Priority] = mapped_column(
        SAEnum(Priority, name="task_priority"), nullable=False, default=Priority.MEDIUM
    )
    due_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    estimated_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    tags: Mapped[list[str]] = mapped_column(ARRAY(String(100)), nullable=False, default=list)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationship back to User (lazy by default, use selectinload when needed)
    user = relationship("User", back_populates="tasks", lazy="noload")

    def __repr__(self) -> str:
        return f"<Task id={self.id} title={self.title!r} priority={self.priority}>"
