from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0005"
down_revision = "0004"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create enum manually only if it does not exist.
    op.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1
                FROM pg_type
                WHERE typname = 'calendar_event_category'
            ) THEN
                CREATE TYPE calendar_event_category AS ENUM (
                    'personal',
                    'work',
                    'study',
                    'health',
                    'other'
                );
            END IF;
        END
        $$;
    """)

    category_enum = postgresql.ENUM(
        "personal",
        "work",
        "study",
        "health",
        "other",
        name="calendar_event_category",
        create_type=False,
    )

    op.create_table(
        "calendar_events",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            nullable=False,
        ),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "title",
            sa.String(255),
            nullable=False,
        ),
        sa.Column(
            "description",
            sa.Text(),
            nullable=True,
        ),
        sa.Column(
            "start_at",
            sa.DateTime(timezone=True),
            nullable=False,
        ),
        sa.Column(
            "end_at",
            sa.DateTime(timezone=True),
            nullable=True,
        ),
        sa.Column(
            "all_day",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
        sa.Column(
            "location",
            sa.String(255),
            nullable=True,
        ),
        sa.Column(
            "category",
            category_enum,
            nullable=False,
            server_default="personal",
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )

    op.create_index(
        "ix_calendar_events_user_id",
        "calendar_events",
        ["user_id"],
    )

    op.create_index(
        "ix_calendar_events_start_at",
        "calendar_events",
        ["start_at"],
    )

    op.create_index(
        "ix_calendar_events_category",
        "calendar_events",
        ["category"],
    )


def downgrade() -> None:
    op.drop_index(
        "ix_calendar_events_category",
        table_name="calendar_events",
    )
    op.drop_index(
        "ix_calendar_events_start_at",
        table_name="calendar_events",
    )
    op.drop_index(
        "ix_calendar_events_user_id",
        table_name="calendar_events",
    )

    op.drop_table("calendar_events")

    op.execute(
        "DROP TYPE IF EXISTS calendar_event_category"
    )
