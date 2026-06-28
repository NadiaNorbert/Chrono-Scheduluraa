"""
Shared Pydantic response schemas used across all API modules.
"""

from pydantic import BaseModel
from typing import Generic, TypeVar

T = TypeVar("T")


class ErrorResponse(BaseModel):
    """
    Standard error envelope returned on all 4xx and 5xx responses.

    Attributes:
        detail: Human-readable error message.
        code: Machine-readable error code string (e.g. INVALID_TOKEN).
    """

    detail: str
    code: str


class HealthResponse(BaseModel):
    """
    Health check response body.

    Attributes:
        status: Always "ok" when the application is running.
    """

    status: str


class PaginatedResponse(BaseModel, Generic[T]):
    """
    Generic paginated list response envelope.

    Attributes:
        items: The page of results.
        total: Total number of matching records across all pages.
        page: Current page number (1-indexed).
        page_size: Number of items per page.
    """

    items: list[T]
    total: int
    page: int
    page_size: int
