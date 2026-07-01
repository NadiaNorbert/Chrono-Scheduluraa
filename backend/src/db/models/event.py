"""CalendarEvent ORM model — a scheduled event on a user's calendar."""

import uuid
from datetime import datetime, timezone
from sqlalchemy import String, DateTime, Boolean, ForeignKey, Text, Integer
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.db.base import Base


class CalendarEvent(Base):
    """
    A calendar event belonging to a user.

    Attributes:
        id:                 UUID primary key.
        user_id:            FK → users.id (cascade delete).
        title:              Event title (max 500 chars).
        description:        Optional notes / agenda.
        start_at:           Event start datetime (UTC).
        end_at:             Event end datetime (UTC).
        all_day:            True for all-day events (time part ignored).
        color_tag:          Optional colour identifier (e.g. "primary", hex).
        location:           Optional location string.
        recurrence:         Optional JSONB recurrence rule.
        created_at:         Record creation timestamp (UTC).
        updated_at:         Last-updated timestamp (UTC).
    """

    __tablename__ = "calendar_events"

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
    start_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    end_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    all_day: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    color_tag: Mapped[str | None] = mapped_column(String(30), nullable=True)
    location: Mapped[str | None] = mapped_column(String(300), nullable=True)
    # Stored as {"frequency": "weekly", "interval": 1, "until": null, "count": null}
    recurrence: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
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

    user = relationship("User", back_populates="calendar_events", lazy="noload")

    def __repr__(self) -> str:
        return f"<CalendarEvent id={self.id} title={self.title!r} start={self.start_at}>"
