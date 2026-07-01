"""
Analytics API — /api/v1/analytics

GET /analytics/report?period=week   Productivity report
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.dependencies import get_db, get_current_user
from src.services.analytics_service import get_productivity_report

router = APIRouter()


@router.get("/report")
async def productivity_report(
    period: str = Query("week", pattern="^(day|week|month)$"),
    clerk_user_id: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Return a productivity report for day / week / month."""
    try:
        return await get_productivity_report(db, clerk_user_id, period)
    except ValueError as e:
        raise HTTPException(404, detail={"detail": str(e), "code": "USER_NOT_FOUND"})
