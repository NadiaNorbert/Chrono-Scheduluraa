"""Central API v1 router."""

from fastapi import APIRouter
from src.api.v1 import health, auth, users, scheduler, calendar, habits, analytics, goals

# [FUTURE M5] from src.api.v1 import collaboration, notifications

api_v1_router = APIRouter()

api_v1_router.include_router(health.router)
api_v1_router.include_router(auth.router,      prefix="/auth",      tags=["auth"])
api_v1_router.include_router(users.router,     prefix="/users",     tags=["users"])
api_v1_router.include_router(scheduler.router, prefix="/tasks",     tags=["tasks"])
api_v1_router.include_router(calendar.router,  prefix="/events",    tags=["calendar"])
api_v1_router.include_router(habits.router,    prefix="/habits",    tags=["habits"])
api_v1_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_v1_router.include_router(goals.router,     prefix="/goals",     tags=["goals"])
