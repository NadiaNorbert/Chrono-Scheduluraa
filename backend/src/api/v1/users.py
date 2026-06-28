"""User endpoints — GET/PATCH /api/v1/users/me"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.dependencies import get_db, get_current_user
from src.schemas.user import UserRead, UserUpdate
from src.services.user_service import get_user_by_clerk_id, update_user
from src.core.logging import get_logger

router = APIRouter()
logger = get_logger(__name__)


async def _get_user_or_404(
    clerk_user_id: str,
    db: AsyncSession,
):
    """Fetch the current user or raise 404."""
    user = await get_user_by_clerk_id(db=db, clerk_user_id=clerk_user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"detail": "User not found", "code": "USER_NOT_FOUND"},
        )
    return user


@router.get("/me", response_model=UserRead, tags=["users"])
async def get_me(
    clerk_user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> UserRead:
    """
    Retrieve the authenticated user's profile.

    Returns the full UserRead schema for the currently signed-in user.
    The user record is identified by the Clerk user ID extracted from the JWT.
    """
    user = await _get_user_or_404(clerk_user_id=clerk_user_id, db=db)
    return UserRead.model_validate(user)


@router.patch("/me", response_model=UserRead, tags=["users"])
async def update_me(
    payload: UserUpdate,
    clerk_user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> UserRead:
    """
    Update the authenticated user's profile.

    Only fields present in the request body are modified (partial update).
    Returns the full updated UserRead schema.
    """
    user = await _get_user_or_404(clerk_user_id=clerk_user_id, db=db)
    updated = await update_user(db=db, user=user, payload=payload)
    return UserRead.model_validate(updated)
