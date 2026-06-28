"""
FastAPI dependency injection providers.

get_db  — yields an async database session per request.
get_current_user — extracts and validates the Clerk user ID from the Bearer token.
"""

from typing import AsyncGenerator
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.security import decode_clerk_jwt
from src.core.logging import get_logger

logger = get_logger(__name__)

# Auto-error=False so we can return MISSING_TOKEN instead of the default 403
_bearer_scheme = HTTPBearer(auto_error=False)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Yield an async SQLAlchemy session for the duration of a request.

    Commits on success, rolls back on any exception, and always closes
    the session in the finally block.
    """
    # Import here to avoid circular imports at module load time
    from src.db.base import AsyncSessionLocal

    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer_scheme),
) -> str:
    """
    Validate the Bearer JWT and return the Clerk user ID (``sub`` claim).

    Args:
        credentials: Injected by FastAPI from the Authorization header.

    Returns:
        The Clerk user ID string (``sub`` claim of the JWT).

    Raises:
        HTTPException 401 MISSING_TOKEN — if Authorization header is absent.
        HTTPException 401 INVALID_TOKEN — if the JWT is invalid or expired.
    """
    if credentials is None:
        logger.warning("Request missing Authorization header on protected endpoint")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"detail": "Authorization header missing", "code": "MISSING_TOKEN"},
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = await decode_clerk_jwt(credentials.credentials)
    clerk_user_id: str = payload["sub"]
    return clerk_user_id
