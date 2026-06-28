"""
Central API v1 router.

Register all domain sub-routers here. Future milestones uncomment
the relevant import and include_router call — no other file changes needed.
"""

from fastapi import APIRouter
from src.api.v1 import health, auth, users

# [FUTURE M2] from src.api.v1 import calendar
# [FUTURE M3] from src.api.v1 import scheduler, habits, notifications
# [FUTURE M4] from src.api.v1 import analytics
# [FUTURE M5] from src.api.v1 import collaboration

api_v1_router = APIRouter()

api_v1_router.include_router(health.router)
api_v1_router.include_router(auth.router,  prefix="/auth",  tags=["auth"])
api_v1_router.include_router(users.router, prefix="/users", tags=["users"])

# [FUTURE M2] api_v1_router.include_router(calendar.router,      prefix="/calendar",      tags=["calendar"])
# [FUTURE M3] api_v1_router.include_router(scheduler.router,     prefix="/scheduler",     tags=["scheduler"])
# [FUTURE M3] api_v1_router.include_router(habits.router,        prefix="/habits",        tags=["habits"])
# [FUTURE M3] api_v1_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
# [FUTURE M4] api_v1_router.include_router(analytics.router,     prefix="/analytics",     tags=["analytics"])
# [FUTURE M5] api_v1_router.include_router(collaboration.router, prefix="/collaboration", tags=["collaboration"])
