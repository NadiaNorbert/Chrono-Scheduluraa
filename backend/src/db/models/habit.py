"""
Habit and HabitLog ORM models.

Habit     — a recurring behaviour a user wants to build.
HabitLog  — a single completion record for a habit on a given date.
"""

import uuid
from datetime import datetime, timezone, date
from sqlalchemy import (
    String, DateTime, Date, Integer, Boolean,
    ForeignKey, Text, Enum as SAEnum
)
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum

from src.db.base import Base


class HabitFrequency(str, enum.Enum):
    DAILY   = "daily"
    WEEKLY  = "weekly"
    MONTHLY = "monthly"


class Habit(Base):
    """
    A habit a user wants to build.

    Attributes:
        id:            UUID primary key.
        user_id:       FK → users.id (cascade delete).
        title:         Habit name (max 200 chars).
        description:   Optional notes.
        frequency:     daily | weekly | monthly.
        target_days:   For weekly habits — which days (0=Mon … 6=Sun).
        color:         UI colour tag (e.g. "primary", "orange").
        icon:          Emoji or icon name for the habit card.
        is_active:     Soft-disable without deleting.
        created_at / updated_at.
    """

    __tablename__ = "habits"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    frequency: Mapped[HabitFrequency] = mapped_column(
        SAEnum(HabitFrequency, name="habit_frequency"),
        nullable=False,
        default=HabitFrequency.DAILY,
    )
    # For weekly: [0,1,2,3,4] = Mon–Fri. Empty = every day of the week.
    target_days: Mapped[list[int]] = mapped_column(
        ARRAY(Integer), nullable=False, default=list
    )
    color: Mapped[str | None] = mapped_column(String(30), nullable=True)
    icon:  Mapped[str | None] = mapped_column(String(10), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
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

    user = relationship("User", back_populates="habits", lazy="noload")
    logs = relationship(
        "HabitLog", back_populates="habit",
        lazy="noload", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Habit id={self.id} title={self.title!r}>"


class HabitLog(Base):
    """
    A single completion record — one row per (habit, date) pair.

    Attributes:
        id:          UUID primary key.
        habit_id:    FK → habits.id (cascade delete).
        user_id:     FK → users.id (cascade delete, for fast queries).
        logged_date: The calendar date this completion belongs to.
        note:        Optional free-text note.
        created_at:  When the log was inserted.
    """

    __tablename__ = "habit_logs"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    habit_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("habits.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    logged_date: Mapped[date] = mapped_column(Date, nullable=False)
    note: Mapped[str | None]  = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    habit = relationship("Habit", back_populates="logs", lazy="noload")

    def __repr__(self) -> str:
        return f"<HabitLog habit_id={self.habit_id} date={self.logged_date}>"
