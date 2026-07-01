"""create tasks table

Revision ID: 002
Revises: 001
Create Date: 2026-06-29 00:00:00.000000
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create task_priority enum type
    op.execute("CREATE TYPE task_priority AS ENUM ('high', 'medium', 'low')")

    op.create_table(
        "tasks",
        sa.Column("id",                 postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id",            postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("title",              sa.String(500),                nullable=False),
        sa.Column("description",        sa.Text(),                     nullable=True),
        sa.Column("priority",           sa.Enum("high", "medium", "low", name="task_priority"), nullable=False, server_default="medium"),
        sa.Column("due_at",             sa.DateTime(timezone=True),    nullable=True),
        sa.Column("estimated_minutes",  sa.Integer(),                  nullable=True),
        sa.Column("completed_at",       sa.DateTime(timezone=True),    nullable=True),
        sa.Column("tags",               postgresql.ARRAY(sa.String(100)), nullable=False, server_default="{}"),
        sa.Column("created_at",         sa.DateTime(timezone=True),    nullable=False),
        sa.Column("updated_at",         sa.DateTime(timezone=True),    nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_tasks_user_id",     "tasks", ["user_id"])
    op.create_index("ix_tasks_due_at",      "tasks", ["due_at"])
    op.create_index("ix_tasks_completed_at","tasks", ["completed_at"])


def downgrade() -> None:
    op.drop_index("ix_tasks_completed_at", table_name="tasks")
    op.drop_index("ix_tasks_due_at",       table_name="tasks")
    op.drop_index("ix_tasks_user_id",      table_name="tasks")
    op.drop_table("tasks")
    op.execute("DROP TYPE task_priority")
