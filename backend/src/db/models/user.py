"""User ORM model — maps the authenticated Clerk user to a local DB record."""

import uuid
from datetime import datetime, timezone
from sqlalchemy import String, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.db.base import Base


class User(Base):
    """
    Represents an authenticated user in Chrono Schedulura.

    Attributes:
        id: Internal UUID primary key.
        clerk_user_id: Clerk's user ID (``sub`` JWT claim). Unique index.
        email: User's primary email address. Unique index.
        display_name: Optional preferred display name (2–80 chars).
        timezone: Optional IANA timezone string (e.g. "America/New_York").
        created_at: Record creation timestamp (UTC).
        updated_at: Last-updated timestamp (UTC), auto-refreshed on change.
    """

    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    clerk_user_id: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True, nullable=False)
    display_name: Mapped[str | None] = mapped_column(String(80), nullable=True)
    timezone: Mapped[str | None] = mapped_column(String(64), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    tasks           = relationship("Task",          back_populates="user", lazy="noload", cascade="all, delete-orphan")
    calendar_events = relationship("CalendarEvent", back_populates="user", lazy="noload", cascade="all, delete-orphan")
    habits          = relationship("Habit",         back_populates="user", lazy="noload", cascade="all, delete-orphan")
    goals           = relationship("Goal",          back_populates="user", lazy="noload", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email!r}>"
