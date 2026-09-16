"""create habits table

Revision ID: 0004
Revises: 0003
Create Date: 2026-09-15
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "0004"
down_revision = "0003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    habit_frequency = postgresql.ENUM(
        "daily",
        "weekly",
        name="habit_frequency",
        create_type=False,
    )

    habit_frequency.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "habits",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column(
            "frequency",
            habit_frequency,
            nullable=False,
            server_default="daily",
        ),
        sa.Column("target_per_week", sa.Integer(), nullable=False, server_default="7"),
        sa.Column("current_streak", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("best_streak", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("last_completed_date", sa.Date(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("start_date", sa.Date(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        "ix_habits_user_id",
        "habits",
        ["user_id"],
    )

    op.create_index(
        "ix_habits_frequency",
        "habits",
        ["frequency"],
    )

    op.create_index(
        "ix_habits_is_active",
        "habits",
        ["is_active"],
    )


def downgrade() -> None:
    op.drop_index("ix_habits_is_active", table_name="habits")
    op.drop_index("ix_habits_frequency", table_name="habits")
    op.drop_index("ix_habits_user_id", table_name="habits")
    op.drop_table("habits")

    habit_frequency = postgresql.ENUM(
        "daily",
        "weekly",
        name="habit_frequency",
    )
    habit_frequency.drop(op.get_bind(), checkfirst=True)

