"""
SQLAlchemy async engine, session factory, and declarative base.

All ORM models import Base from this module. The get_db dependency
is defined in src.core.dependencies to avoid circular imports.
"""

from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    create_async_engine,
    async_sessionmaker,
)
from sqlalchemy.orm import DeclarativeBase

from src.core.config import settings
from src.core.logging import get_logger

logger = get_logger(__name__)


# ── Engine ────────────────────────────────────────────────────────────────────
engine: AsyncEngine = create_async_engine(
    settings.database_url,
    echo=False,                 # Set True temporarily to debug SQL queries
    pool_pre_ping=True,         # Verify connections before checkout
    pool_size=10,
    max_overflow=20,
)

# ── Session factory ───────────────────────────────────────────────────────────
AsyncSessionLocal: async_sessionmaker[AsyncSession] = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,     # Prevent lazy-load errors after commit
    autocommit=False,
    autoflush=False,
)


# ── Declarative base ──────────────────────────────────────────────────────────
class Base(DeclarativeBase):
    """
    Base class for all SQLAlchemy ORM models.

    Alembic's autogenerate detects schema changes by inspecting
    subclasses of this Base.
    """
    pass
