import uuid
from datetime import date
from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.finance_account import FinanceAccount
from app.models.finance_transaction import FinanceTransaction, TransactionType
from app.schemas.finance_transaction import (
    FinanceSummary,
    FinanceTransactionCreate,
    FinanceTransactionUpdate,
)


class FinanceTransactionNotFound(Exception):
    pass


class FinanceAccountNotFound(Exception):
    pass


def _get_account_or_raise(
    db: Session,
    user_id: uuid.UUID,
    account_id: uuid.UUID,
) -> FinanceAccount:
    account = db.scalar(
        select(FinanceAccount).where(
            FinanceAccount.id == account_id,
            FinanceAccount.user_id == user_id,
            FinanceAccount.is_active.is_(True),
        )
    )

    if account is None:
        raise FinanceAccountNotFound

    return account


def _get_transaction_or_raise(
    db: Session,
    user_id: uuid.UUID,
    transaction_id: uuid.UUID,
) -> FinanceTransaction:
    transaction = db.scalar(
        select(FinanceTransaction).where(
            FinanceTransaction.id == transaction_id,
            FinanceTransaction.user_id == user_id,
        )
    )

    if transaction is None:
        raise FinanceTransactionNotFound

    return transaction


def _signed_amount(
    transaction_type: TransactionType,
    amount: Decimal,
) -> Decimal:
    if transaction_type == TransactionType.INCOME:
        return amount

    return -amount


def create_transaction(
    db: Session,
    user_id: uuid.UUID,
    payload: FinanceTransactionCreate,
) -> FinanceTransaction:

    account = _get_account_or_raise(
        db,
        user_id,
        payload.account_id,
    )

    transaction = FinanceTransaction(
        user_id=user_id,
        account_id=payload.account_id,
        transaction_type=payload.transaction_type,
        title=payload.title,
        amount=payload.amount,
        category=payload.category,
        description=payload.description,
        transaction_date=payload.transaction_date,
    )

    account.balance += _signed_amount(
        payload.transaction_type,
        payload.amount,
    )

    db.add(transaction)
    db.commit()
    db.refresh(transaction)

    return transaction


def get_transaction_or_raise(
    db: Session,
    user_id: uuid.UUID,
    transaction_id: uuid.UUID,
) -> FinanceTransaction:

    return _get_transaction_or_raise(
        db,
        user_id,
        transaction_id,
    )


def list_transactions(
    db: Session,
    user_id: uuid.UUID,
    page: int = 1,
    page_size: int = 20,
    transaction_type: TransactionType | None = None,
    category: str | None = None,
):
    query = select(FinanceTransaction).where(
        FinanceTransaction.user_id == user_id
    )

    count_query = select(
        func.count(FinanceTransaction.id)
    ).where(
        FinanceTransaction.user_id == user_id
    )

    if transaction_type is not None:
        query = query.where(
            FinanceTransaction.transaction_type == transaction_type.value
        )
        count_query = count_query.where(
            FinanceTransaction.transaction_type == transaction_type.value
        )

    if category:
        query = query.where(
            FinanceTransaction.category == category
        )
        count_query = count_query.where(
            FinanceTransaction.category == category
        )

    query = (
        query
        .order_by(
            FinanceTransaction.transaction_date.desc(),
            FinanceTransaction.created_at.desc(),
        )
        .offset((page - 1) * page_size)
        .limit(page_size)
    )

    transactions = list(db.scalars(query).all())
    total = db.scalar(count_query) or 0

    return transactions, total


def update_transaction(
    db: Session,
    user_id: uuid.UUID,
    transaction_id: uuid.UUID,
    payload: FinanceTransactionUpdate,
) -> FinanceTransaction:

    transaction = _get_transaction_or_raise(
        db,
        user_id,
        transaction_id,
    )

    old_account = _get_account_or_raise(
        db,
        user_id,
        transaction.account_id,
    )

    # Remove the old transaction's effect.
    old_account.balance -= _signed_amount(
        transaction.transaction_type,
        transaction.amount,
    )

    update_data = payload.model_dump(exclude_unset=True)

    new_account_id = update_data.get(
        "account_id",
        transaction.account_id,
    )

    new_account = _get_account_or_raise(
        db,
        user_id,
        new_account_id,
    )

    new_type = update_data.get(
        "transaction_type",
        transaction.transaction_type,
    )

    new_amount = update_data.get(
        "amount",
        transaction.amount,
    )

    for field, value in update_data.items():
        setattr(transaction, field, value)

    # Apply the updated transaction's effect.
    new_account.balance += _signed_amount(
        new_type,
        new_amount,
    )

    db.commit()
    db.refresh(transaction)

    return transaction


def delete_transaction(
    db: Session,
    user_id: uuid.UUID,
    transaction_id: uuid.UUID,
) -> None:

    transaction = _get_transaction_or_raise(
        db,
        user_id,
        transaction_id,
    )

    account = _get_account_or_raise(
        db,
        user_id,
        transaction.account_id,
    )

    # Reverse the transaction's effect.
    account.balance -= _signed_amount(
        transaction.transaction_type,
        transaction.amount,
    )

    db.delete(transaction)
    db.commit()


def calculate_finance_summary(
    db: Session,
    user_id: uuid.UUID,
) -> FinanceSummary:

    total_income = db.scalar(
        select(
            func.coalesce(
                func.sum(FinanceTransaction.amount),
                0,
            )
        ).where(
            FinanceTransaction.user_id == user_id,
            FinanceTransaction.transaction_type == "income",
        )
    ) or Decimal("0.00")

    total_expense = db.scalar(
        select(
            func.coalesce(
                func.sum(FinanceTransaction.amount),
                0,
            )
        ).where(
            FinanceTransaction.user_id == user_id,
            FinanceTransaction.transaction_type == "expense",
        )
    ) or Decimal("0.00")

    return FinanceSummary(
        total_income=Decimal(str(total_income)),
        total_expense=Decimal(str(total_expense)),
        net_balance=Decimal(str(total_income))
        - Decimal(str(total_expense)),
    )