"""create habits and habit_logs tables

Revision ID: 004
Revises: 003
Create Date: 2026-07-01 00:00:00.000000
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "004"
down_revision: Union[str, None] = "003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("CREATE TYPE habit_frequency AS ENUM ('daily', 'weekly', 'monthly')")

    op.create_table(
        "habits",
        sa.Column("id",          postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id",     postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("title",       sa.String(200),                nullable=False),
        sa.Column("description", sa.Text(),                     nullable=True),
        sa.Column("frequency",   sa.Enum("daily", "weekly", "monthly", name="habit_frequency"), nullable=False, server_default="daily"),
        sa.Column("target_days", postgresql.ARRAY(sa.Integer()), nullable=False, server_default="{}"),
        sa.Column("color",       sa.String(30),                 nullable=True),
        sa.Column("icon",        sa.String(10),                 nullable=True),
        sa.Column("is_active",   sa.Boolean(),                  nullable=False, server_default="true"),
        sa.Column("created_at",  sa.DateTime(timezone=True),    nullable=False),
        sa.Column("updated_at",  sa.DateTime(timezone=True),    nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_habits_user_id", "habits", ["user_id"])

    op.create_table(
        "habit_logs",
        sa.Column("id",          postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("habit_id",    postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id",     postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("logged_date", sa.Date(),                     nullable=False),
        sa.Column("note",        sa.String(500),                nullable=True),
        sa.Column("created_at",  sa.DateTime(timezone=True),    nullable=False),
        sa.ForeignKeyConstraint(["habit_id"], ["habits.id"],   ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"],  ["users.id"],    ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_habit_logs_habit_id",    "habit_logs", ["habit_id"])
    op.create_index("ix_habit_logs_user_id",     "habit_logs", ["user_id"])
    op.create_index("ix_habit_logs_logged_date", "habit_logs", ["logged_date"])
    # Unique: one log per habit per day
    op.create_unique_constraint("uq_habit_logs_habit_date", "habit_logs", ["habit_id", "logged_date"])


def downgrade() -> None:
    op.drop_constraint("uq_habit_logs_habit_date", "habit_logs", type_="unique")
    op.drop_index("ix_habit_logs_logged_date", table_name="habit_logs")
    op.drop_index("ix_habit_logs_user_id",     table_name="habit_logs")
    op.drop_index("ix_habit_logs_habit_id",    table_name="habit_logs")
    op.drop_table("habit_logs")
    op.drop_index("ix_habits_user_id", table_name="habits")
    op.drop_table("habits")
    op.execute("DROP TYPE habit_frequency")
