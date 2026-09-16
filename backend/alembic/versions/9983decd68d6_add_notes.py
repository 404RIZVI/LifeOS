from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "9983decd68d6"
down_revision = "0005"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "notes",
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
            "content",
            sa.Text(),
            nullable=True,
        ),
        sa.Column(
            "category",
            sa.String(100),
            nullable=True,
        ),
        sa.Column(
            "tags",
            sa.Text(),
            nullable=True,
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
        "ix_notes_user_id",
        "notes",
        ["user_id"],
    )

    op.create_index(
        "ix_notes_category",
        "notes",
        ["category"],
    )


def downgrade() -> None:
    op.drop_index(
        "ix_notes_category",
        table_name="notes",
    )

    op.drop_index(
        "ix_notes_user_id",
        table_name="notes",
    )

    op.drop_table("notes")