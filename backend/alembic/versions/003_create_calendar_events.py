"""create calendar_events table

Revision ID: 003
Revises: 002
Create Date: 2026-06-29 00:00:00.000000
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "003"
down_revision: Union[str, None] = "002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "calendar_events",
        sa.Column("id",          postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id",     postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("title",       sa.String(500),                nullable=False),
        sa.Column("description", sa.Text(),                     nullable=True),
        sa.Column("start_at",    sa.DateTime(timezone=True),    nullable=False),
        sa.Column("end_at",      sa.DateTime(timezone=True),    nullable=False),
        sa.Column("all_day",     sa.Boolean(),                  nullable=False, server_default="false"),
        sa.Column("color_tag",   sa.String(30),                 nullable=True),
        sa.Column("location",    sa.String(300),                nullable=True),
        sa.Column("recurrence",  postgresql.JSONB(),            nullable=True),
        sa.Column("created_at",  sa.DateTime(timezone=True),    nullable=False),
        sa.Column("updated_at",  sa.DateTime(timezone=True),    nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_calendar_events_user_id",  "calendar_events", ["user_id"])
    op.create_index("ix_calendar_events_start_at", "calendar_events", ["start_at"])
    op.create_index("ix_calendar_events_end_at",   "calendar_events", ["end_at"])


def downgrade() -> None:
    op.drop_index("ix_calendar_events_end_at",   table_name="calendar_events")
    op.drop_index("ix_calendar_events_start_at", table_name="calendar_events")
    op.drop_index("ix_calendar_events_user_id",  table_name="calendar_events")
    op.drop_table("calendar_events")
