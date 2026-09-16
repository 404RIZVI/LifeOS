"""add ai conversations and messages

Revision ID: f73d4419168d
Revises: d02039810e96
Create Date: 2026-09-16 04:44:07.120252
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

from app.models.types import GUID


revision: str = "f73d4419168d"
down_revision: Union[str, None] = "d02039810e96"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ========================================================
    # AI CONVERSATIONS
    # ========================================================

    op.create_table(
        "ai_conversations",
        sa.Column(
            "user_id",
            GUID(),
            nullable=False,
        ),
        sa.Column(
            "title",
            sa.String(length=255),
            nullable=False,
        ),
        sa.Column(
            "last_message_at",
            sa.DateTime(timezone=True),
            nullable=True,
        ),
        sa.Column(
            "id",
            GUID(),
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        "ix_ai_conversations_user_id",
        "ai_conversations",
        ["user_id"],
        unique=False,
    )

    op.create_index(
        "ix_ai_conversations_last_message_at",
        "ai_conversations",
        ["last_message_at"],
        unique=False,
    )

    # ========================================================
    # AI MESSAGES
    # ========================================================

    op.create_table(
        "ai_messages",
        sa.Column(
            "conversation_id",
            GUID(),
            nullable=False,
        ),
        sa.Column(
            "role",
            sa.String(length=20),
            nullable=False,
        ),
        sa.Column(
            "content",
            sa.Text(),
            nullable=False,
        ),
        sa.Column(
            "id",
            GUID(),
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["conversation_id"],
            ["ai_conversations.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        "ix_ai_messages_conversation_id",
        "ai_messages",
        ["conversation_id"],
        unique=False,
    )


def downgrade() -> None:
    # ========================================================
    # REMOVE AI MESSAGES
    # ========================================================

    op.drop_index(
        "ix_ai_messages_conversation_id",
        table_name="ai_messages",
    )

    op.drop_table("ai_messages")

    # ========================================================
    # REMOVE AI CONVERSATIONS
    # ========================================================

    op.drop_index(
        "ix_ai_conversations_last_message_at",
        table_name="ai_conversations",
    )

    op.drop_index(
        "ix_ai_conversations_user_id",
        table_name="ai_conversations",
    )

    op.drop_table("ai_conversations")