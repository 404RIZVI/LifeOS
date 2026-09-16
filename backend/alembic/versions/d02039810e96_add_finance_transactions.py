"""add finance transactions

Revision ID: d02039810e96
Revises: 0006
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "d02039810e96"
down_revision = "0006"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create enum safely
    op.execute(
        """
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1
                FROM pg_type
                WHERE typname = 'finance_transaction_type'
            ) THEN
                CREATE TYPE finance_transaction_type AS ENUM (
                    'income',
                    'expense'
                );
            END IF;
        END
        $$;
        """
    )

    transaction_type = postgresql.ENUM(
        "income",
        "expense",
        name="finance_transaction_type",
        create_type=False,
    )

    op.create_table(
        "finance_transactions",
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
            "account_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("finance_accounts.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "transaction_type",
            transaction_type,
            nullable=False,
        ),
        sa.Column(
            "title",
            sa.String(length=255),
            nullable=False,
        ),
        sa.Column(
            "amount",
            sa.Numeric(12, 2),
            nullable=False,
        ),
        sa.Column(
            "category",
            sa.String(length=100),
            nullable=False,
        ),
        sa.Column(
            "description",
            sa.Text(),
            nullable=True,
        ),
        sa.Column(
            "transaction_date",
            sa.Date(),
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
    )

    op.create_index(
        "ix_finance_transactions_user_id",
        "finance_transactions",
        ["user_id"],
    )

    op.create_index(
        "ix_finance_transactions_account_id",
        "finance_transactions",
        ["account_id"],
    )

    op.create_index(
        "ix_finance_transactions_transaction_type",
        "finance_transactions",
        ["transaction_type"],
    )

    op.create_index(
        "ix_finance_transactions_category",
        "finance_transactions",
        ["category"],
    )

    op.create_index(
        "ix_finance_transactions_transaction_date",
        "finance_transactions",
        ["transaction_date"],
    )


def downgrade() -> None:
    op.drop_index(
        "ix_finance_transactions_transaction_date",
        table_name="finance_transactions",
    )
    op.drop_index(
        "ix_finance_transactions_category",
        table_name="finance_transactions",
    )
    op.drop_index(
        "ix_finance_transactions_transaction_type",
        table_name="finance_transactions",
    )
    op.drop_index(
        "ix_finance_transactions_account_id",
        table_name="finance_transactions",
    )
    op.drop_index(
        "ix_finance_transactions_user_id",
        table_name="finance_transactions",
    )

    op.drop_table("finance_transactions")

    op.execute(
        """
        DROP TYPE IF EXISTS finance_transaction_type;
        """
    )