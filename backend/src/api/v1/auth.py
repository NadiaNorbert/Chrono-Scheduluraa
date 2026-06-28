"""Auth-related endpoints — Clerk webhook receiver."""

from fastapi import APIRouter, Request, HTTPException, status
from src.core.dependencies import get_db
from src.services.user_service import get_or_create_user
from src.core.logging import get_logger
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter()
logger = get_logger(__name__)


@router.post("/webhook/clerk", tags=["auth"], status_code=200)
async def clerk_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """
    Receive Clerk webhook events and sync user data to the local database.

    Handles the ``user.created`` event by upserting a User record.
    Configure this URL in your Clerk dashboard under Webhooks:
        POST https://your-domain.com/api/v1/auth/webhook/clerk

    Note: In production, verify the Clerk-Signature header using svix.
    """
    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"detail": "Invalid JSON payload", "code": "INVALID_PAYLOAD"},
        )

    event_type: str = payload.get("type", "")
    data: dict = payload.get("data", {})

    logger.info("Received Clerk webhook event: %s", event_type)

    if event_type == "user.created":
        clerk_user_id: str = data.get("id", "")
        email_addresses: list = data.get("email_addresses", [])
        email: str = (
            email_addresses[0].get("email_address", "") if email_addresses else ""
        )

        if not clerk_user_id or not email:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail={"detail": "Missing user ID or email in webhook payload", "code": "MISSING_FIELDS"},
            )

        await get_or_create_user(db=db, clerk_user_id=clerk_user_id, email=email)
        logger.info("Upserted user from webhook clerk_user_id=%s", clerk_user_id)

    return {"received": True}
