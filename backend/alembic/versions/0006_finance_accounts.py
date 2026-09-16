"""create finance accounts

Revision ID: 0006
Revises: 9983decd68d6
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "0006"
down_revision = "9983decd68d6"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create enum only if it does not already exist.
    op.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1
                FROM pg_type
                WHERE typname = 'finance_account_type'
            ) THEN
                CREATE TYPE finance_account_type AS ENUM (
                    'cash',
                    'bank',
                    'wallet',
                    'credit_card',
                    'other'
                );
            END IF;
        END
        $$;
    """)

    account_type = postgresql.ENUM(
        "cash",
        "bank",
        "wallet",
        "credit_card",
        "other",
        name="finance_account_type",
        create_type=False,
    )

    op.create_table(
        "finance_accounts",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column(
            "user_id",
            sa.UUID(),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "name",
            sa.String(length=255),
            nullable=False,
        ),
        sa.Column(
            "account_type",
            account_type,
            nullable=False,
        ),
        sa.Column(
            "balance",
            sa.Numeric(12, 2),
            nullable=False,
            server_default="0",
        ),
        sa.Column(
            "description",
            sa.Text(),
            nullable=True,
        ),
        sa.Column(
            "currency",
            sa.String(length=3),
            nullable=False,
            server_default="INR",
        ),
        sa.Column(
            "is_active",
            sa.Boolean(),
            nullable=False,
            server_default=sa.true(),
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
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        "ix_finance_accounts_user_id",
        "finance_accounts",
        ["user_id"],
    )

    op.create_index(
        "ix_finance_accounts_account_type",
        "finance_accounts",
        ["account_type"],
    )

    op.create_index(
        "ix_finance_accounts_is_active",
        "finance_accounts",
        ["is_active"],
    )


def downgrade() -> None:
    op.drop_index(
        "ix_finance_accounts_is_active",
        table_name="finance_accounts",
    )

    op.drop_index(
        "ix_finance_accounts_account_type",
        table_name="finance_accounts",
    )

    op.drop_index(
        "ix_finance_accounts_user_id",
        table_name="finance_accounts",
    )

    op.drop_table("finance_accounts")

    op.execute(
        "DROP TYPE IF EXISTS finance_account_type"
    )