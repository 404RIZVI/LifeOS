"""create goals table

Revision ID: 0003
Revises: 0002
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "0003"
down_revision = "0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    goal_status = postgresql.ENUM(
        "active",
        "completed",
        name="goal_status",
        create_type=False,
    )

    op.execute("""
    DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM pg_type WHERE typname = 'goal_status'
        ) THEN
            CREATE TYPE goal_status AS ENUM ('active', 'completed');
        END IF;
    END
    $$;
    """)

    op.create_table(
        "goals",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("status", goal_status, nullable=False, server_default="active"),
        sa.Column("progress", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("category", sa.String(length=100), nullable=True),
        sa.Column("start_date", sa.Date(), nullable=True),
        sa.Column("target_date", sa.Date(), nullable=True),
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
        "ix_goals_user_id",
        "goals",
        ["user_id"],
    )

    op.create_index(
        "ix_goals_status",
        "goals",
        ["status"],
    )

    op.create_index(
        "ix_goals_target_date",
        "goals",
        ["target_date"],
    )


def downgrade() -> None:
    op.drop_index("ix_goals_target_date", table_name="goals")
    op.drop_index("ix_goals_status", table_name="goals")
    op.drop_index("ix_goals_user_id", table_name="goals")
    op.drop_table("goals")
    op.execute("DROP TYPE IF EXISTS goal_status")
