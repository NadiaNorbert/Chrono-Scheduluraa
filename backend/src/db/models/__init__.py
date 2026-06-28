# Import all models here so Alembic autogenerate can detect them
from src.db.models.user import User  # noqa: F401

# [FUTURE M2] from src.db.models.event import CalendarEvent
# [FUTURE M3] from src.db.models.task import Task
# [FUTURE M3] from src.db.models.habit import Habit
# [FUTURE M3] from src.db.models.notification import Notification
# [FUTURE M5] from src.db.models.collaboration import Workspace, WorkspaceMember
