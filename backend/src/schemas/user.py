"""
Pydantic schemas for user-related API request and response bodies.
"""

import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class UserRead(BaseModel):
    """
    Full user record returned by the API.

    Attributes:
        id: Internal UUID primary key.
        clerk_user_id: Clerk user ID linked to this record.
        email: User's primary email address.
        display_name: Optional preferred display name.
        timezone: Optional IANA timezone string.
        created_at: Record creation timestamp (UTC).
        updated_at: Record last-updated timestamp (UTC).
    """

    id: uuid.UUID
    clerk_user_id: str
    email: EmailStr
    display_name: Optional[str] = None
    timezone: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    """
    Partial update payload for the authenticated user's profile.

    All fields are optional — only provided fields are updated.

    Attributes:
        display_name: New display name (2–80 characters after stripping whitespace).
        timezone: New IANA timezone string (e.g. "Europe/London").
    """

    display_name: Optional[str] = Field(
        default=None,
        min_length=2,
        max_length=80,
        description="Preferred display name (2–80 characters)",
    )
    timezone: Optional[str] = Field(
        default=None,
        max_length=64,
        description="IANA timezone string e.g. America/New_York",
    )
