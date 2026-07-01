"""create goals and milestones tables

Revision ID: 005
Revises: 004
Create Date: 2026-07-01 00:00:00.000000
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "005"
down_revision: Union[str, None] = "004"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("CREATE TYPE goal_status AS ENUM ('active', 'completed', 'paused', 'abandoned')")

    op.create_table(
        "goals",
        sa.Column("id",          postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id",     postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("title",       sa.String(300),                nullable=False),
        sa.Column("description", sa.Text(),                     nullable=True),
        sa.Column("status",      sa.Enum("active", "completed", "paused", "abandoned", name="goal_status"),
                  nullable=False, server_default="active"),
        sa.Column("target_date", sa.Date(),                     nullable=True),
        sa.Column("color",       sa.String(30),                 nullable=True),
        sa.Column("icon",        sa.String(10),                 nullable=True),
        sa.Column("progress",    sa.Integer(),                  nullable=False, server_default="0"),
        sa.Column("created_at",  sa.DateTime(timezone=True),    nullable=False),
        sa.Column("updated_at",  sa.DateTime(timezone=True),    nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_goals_user_id",     "goals", ["user_id"])
    op.create_index("ix_goals_status",      "goals", ["status"])

    op.create_table(
        "milestones",
        sa.Column("id",          postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("goal_id",     postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id",     postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("title",       sa.String(300),                nullable=False),
        sa.Column("is_done",     sa.Boolean(),                  nullable=False, server_default="false"),
        sa.Column("due_date",    sa.Date(),                     nullable=True),
        sa.Column("order_index", sa.Integer(),                  nullable=False, server_default="0"),
        sa.Column("created_at",  sa.DateTime(timezone=True),    nullable=False),
        sa.ForeignKeyConstraint(["goal_id"], ["goals.id"],  ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"],  ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_milestones_goal_id", "milestones", ["goal_id"])


def downgrade() -> None:
    op.drop_index("ix_milestones_goal_id", table_name="milestones")
    op.drop_table("milestones")
    op.drop_index("ix_goals_status",  table_name="goals")
    op.drop_index("ix_goals_user_id", table_name="goals")
    op.drop_table("goals")
    op.execute("DROP TYPE goal_status")
