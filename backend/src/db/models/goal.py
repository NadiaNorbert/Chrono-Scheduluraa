"""
Goal and Milestone ORM models.

Goal      — a high-level objective a user wants to achieve.
Milestone — a measurable checkpoint within a goal.
"""

import uuid
from datetime import datetime, timezone, date
from sqlalchemy import String, DateTime, Date, Integer, Boolean, ForeignKey, Text, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum

from src.db.base import Base


class GoalStatus(str, enum.Enum):
    ACTIVE    = "active"
    COMPLETED = "completed"
    PAUSED    = "paused"
    ABANDONED = "abandoned"


class Goal(Base):
    """
    A user goal — high-level objective with optional deadline and milestones.

    Attributes:
        id:          UUID PK.
        user_id:     FK → users.id (cascade delete).
        title:       Goal title (max 300).
        description: Optional rich notes.
        status:      active | completed | paused | abandoned.
        target_date: Optional deadline.
        color:       UI colour tag.
        icon:        Emoji for the goal card.
        progress:    0–100 manually set or computed from milestones.
        created_at / updated_at.
    """

    __tablename__ = "goals"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title:       Mapped[str]          = mapped_column(String(300), nullable=False)
    description: Mapped[str | None]   = mapped_column(Text, nullable=True)
    status: Mapped[GoalStatus] = mapped_column(
        SAEnum(GoalStatus, name="goal_status"),
        nullable=False,
        default=GoalStatus.ACTIVE,
    )
    target_date: Mapped[date | None]  = mapped_column(Date, nullable=True)
    color:       Mapped[str | None]   = mapped_column(String(30), nullable=True)
    icon:        Mapped[str | None]   = mapped_column(String(10), nullable=True)
    progress:    Mapped[int]          = mapped_column(Integer, nullable=False, default=0)
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

    user       = relationship("User", back_populates="goals", lazy="noload")
    milestones = relationship(
        "Milestone", back_populates="goal",
        lazy="noload", cascade="all, delete-orphan",
        order_by="Milestone.order_index",
    )

    def __repr__(self) -> str:
        return f"<Goal id={self.id} title={self.title!r}>"


class Milestone(Base):
    """
    A checkpoint within a Goal.

    Attributes:
        id:          UUID PK.
        goal_id:     FK → goals.id (cascade delete).
        user_id:     FK → users.id (cascade delete).
        title:       Milestone title.
        is_done:     True when completed.
        due_date:    Optional target date.
        order_index: Sort order within the goal.
    """

    __tablename__ = "milestones"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    goal_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("goals.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    title:       Mapped[str]         = mapped_column(String(300), nullable=False)
    is_done:     Mapped[bool]        = mapped_column(Boolean, nullable=False, default=False)
    due_date:    Mapped[date | None] = mapped_column(Date, nullable=True)
    order_index: Mapped[int]         = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    goal = relationship("Goal", back_populates="milestones", lazy="noload")

    def __repr__(self) -> str:
        return f"<Milestone id={self.id} title={self.title!r} done={self.is_done}>"
