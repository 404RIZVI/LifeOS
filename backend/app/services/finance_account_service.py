import uuid
from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.finance_account import FinanceAccount
from app.schemas.finance_account import (
    FinanceAccountCreate,
    FinanceAccountUpdate,
)


class FinanceAccountNotFound(Exception):
    pass


def create_account(
    db: Session,
    user_id: uuid.UUID,
    payload: FinanceAccountCreate,
) -> FinanceAccount:
    account = FinanceAccount(
        user_id=user_id,
        name=payload.name,
        account_type=payload.account_type,
        balance=payload.balance,
        description=payload.description,
        currency=payload.currency.upper(),
        is_active=True,
    )

    db.add(account)
    db.commit()
    db.refresh(account)

    return account


def get_account_or_raise(
    db: Session,
    user_id: uuid.UUID,
    account_id: uuid.UUID,
) -> FinanceAccount:
    account = db.scalar(
        select(FinanceAccount).where(
            FinanceAccount.id == account_id,
            FinanceAccount.user_id == user_id,
        )
    )

    if account is None:
        raise FinanceAccountNotFound

    return account


def list_accounts(
    db: Session,
    user_id: uuid.UUID,
    page: int = 1,
    page_size: int = 20,
    include_inactive: bool = False,
) -> tuple[list[FinanceAccount], int]:
    query = select(FinanceAccount).where(
        FinanceAccount.user_id == user_id
    )

    count_query = select(
        func.count(FinanceAccount.id)
    ).where(
        FinanceAccount.user_id == user_id
    )

    if not include_inactive:
        query = query.where(
            FinanceAccount.is_active.is_(True)
        )
        count_query = count_query.where(
            FinanceAccount.is_active.is_(True)
        )

    query = (
        query
        .order_by(FinanceAccount.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )

    accounts = list(db.scalars(query).all())
    total = db.scalar(count_query) or 0

    return accounts, total


def update_account(
    db: Session,
    user_id: uuid.UUID,
    account_id: uuid.UUID,
    payload: FinanceAccountUpdate,
) -> FinanceAccount:
    account = get_account_or_raise(
        db,
        user_id,
        account_id,
    )

    update_data = payload.model_dump(
        exclude_unset=True
    )

    if "currency" in update_data and update_data["currency"]:
        update_data["currency"] = update_data["currency"].upper()

    for field, value in update_data.items():
        setattr(account, field, value)

    db.commit()
    db.refresh(account)

    return account


def delete_account(
    db: Session,
    user_id: uuid.UUID,
    account_id: uuid.UUID,
) -> None:
    account = get_account_or_raise(
        db,
        user_id,
        account_id,
    )

    account.is_active = False

    db.commit()


def calculate_total_balance(
    db: Session,
    user_id: uuid.UUID,
) -> Decimal:
    total = db.scalar(
        select(
            func.coalesce(
                func.sum(FinanceAccount.balance),
                0,
            )
        ).where(
            FinanceAccount.user_id == user_id,
            FinanceAccount.is_active.is_(True),
        )
    )

    return Decimal(str(total or 0))