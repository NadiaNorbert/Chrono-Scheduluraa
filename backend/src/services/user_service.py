"""
User service — business logic for user creation and profile management.

All database interaction goes through this service; route handlers
never access the ORM directly.
"""

from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.db.models.user import User
from src.schemas.user import UserUpdate
from src.core.logging import get_logger

logger = get_logger(__name__)


async def get_or_create_user(
    db: AsyncSession,
    clerk_user_id: str,
    email: str,
) -> User:
    """
    Return the existing user record or create a new one.

    Called during the Clerk webhook (user.created) and as a lazy-sync
    on first authenticated API request.

    Args:
        db: Active async database session.
        clerk_user_id: Clerk ``sub`` claim from the JWT.
        email: User's primary email address from Clerk.

    Returns:
        The User ORM instance (existing or freshly created).
    """
    result = await db.execute(
        select(User).where(User.clerk_user_id == clerk_user_id)
    )
    user = result.scalar_one_or_none()

    if user is None:
        logger.info("Creating new user record for clerk_user_id=%s", clerk_user_id)
        user = User(
            clerk_user_id=clerk_user_id,
            email=email,
        )
        db.add(user)
        await db.flush()  # populate user.id without committing
        logger.info("User created id=%s", user.id)
    else:
        logger.debug("Found existing user id=%s", user.id)

    return user


async def get_user_by_clerk_id(
    db: AsyncSession,
    clerk_user_id: str,
) -> User | None:
    """
    Fetch a user by their Clerk user ID.

    Args:
        db: Active async database session.
        clerk_user_id: Clerk ``sub`` claim.

    Returns:
        The User ORM instance, or None if not found.
    """
    result = await db.execute(
        select(User).where(User.clerk_user_id == clerk_user_id)
    )
    return result.scalar_one_or_none()


async def update_user(
    db: AsyncSession,
    user: User,
    payload: UserUpdate,
) -> User:
    """
    Apply a partial update to a user's profile.

    Only fields explicitly provided in the payload are updated.

    Args:
        db: Active async database session.
        user: The User ORM instance to update.
        payload: Validated update payload (display_name, timezone).

    Returns:
        The updated User ORM instance.
    """
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)

    user.updated_at = datetime.now(timezone.utc)
    await db.flush()
    logger.info("User id=%s updated fields=%s", user.id, list(update_data.keys()))
    return user
