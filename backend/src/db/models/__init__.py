# Import all models here so Alembic autogenerate can detect them
from src.db.models.user import User                   # noqa: F401
from src.db.models.task import Task                   # noqa: F401
from src.db.models.event import CalendarEvent         # noqa: F401
from src.db.models.habit import Habit, HabitLog       # noqa: F401
from src.db.models.goal import Goal, Milestone        # noqa: F401

# [FUTURE M5] from src.db.models.notification import Notification
# [FUTURE M6] from src.db.models.collaboration import Workspace, WorkspaceMember
