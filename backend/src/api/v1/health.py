"""Health check endpoint — GET /api/v1/health"""

from fastapi import APIRouter
from src.schemas.common import HealthResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse, tags=["health"])
async def health_check() -> HealthResponse:
    """
    Application health check.

    Returns 200 OK with ``{"status": "ok"}`` when the application is running.
    Used by Docker Compose healthchecks, load balancers, and uptime monitors.
    """
    return HealthResponse(status="ok")
