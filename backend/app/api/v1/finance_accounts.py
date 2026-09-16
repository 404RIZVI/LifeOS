import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.finance_account import (
    FinanceAccountCreate,
    FinanceAccountListResponse,
    FinanceAccountOut,
    FinanceAccountUpdate,
)
from app.services import finance_account_service


router = APIRouter(
    prefix="/finance/accounts",
    tags=["finance"],
)


@router.get(
    "",
    response_model=FinanceAccountListResponse,
)
def list_accounts(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    include_inactive: bool = Query(False),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    accounts, total = finance_account_service.list_accounts(
        db=db,
        user_id=current_user.id,
        page=page,
        page_size=page_size,
        include_inactive=include_inactive,
    )

    total_pages = (total + page_size - 1) // page_size

    return FinanceAccountListResponse(
        items=[
            FinanceAccountOut.model_validate(account)
            for account in accounts
        ],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.post(
    "",
    response_model=FinanceAccountOut,
    status_code=status.HTTP_201_CREATED,
)
def create_account(
    payload: FinanceAccountCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    account = finance_account_service.create_account(
        db=db,
        user_id=current_user.id,
        payload=payload,
    )

    return FinanceAccountOut.model_validate(account)


# IMPORTANT:
# Summary route must come BEFORE /{account_id}
# so "summary" is not interpreted as a UUID.
@router.get(
    "/summary/balance",
)
def get_total_balance(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    total_balance = finance_account_service.calculate_total_balance(
        db=db,
        user_id=current_user.id,
    )

    return {
        "total_balance": total_balance,
        "currency": "INR",
    }


@router.get(
    "/{account_id}",
    response_model=FinanceAccountOut,
)
def get_account(
    account_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        account = finance_account_service.get_account_or_raise(
            db=db,
            user_id=current_user.id,
            account_id=account_id,
        )
    except finance_account_service.FinanceAccountNotFound:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Finance account not found.",
        )

    return FinanceAccountOut.model_validate(account)


@router.put(
    "/{account_id}",
    response_model=FinanceAccountOut,
)
def update_account(
    account_id: uuid.UUID,
    payload: FinanceAccountUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        account = finance_account_service.update_account(
            db=db,
            user_id=current_user.id,
            account_id=account_id,
            payload=payload,
        )
    except finance_account_service.FinanceAccountNotFound:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Finance account not found.",
        )

    return FinanceAccountOut.model_validate(account)


@router.delete(
    "/{account_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_account(
    account_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        finance_account_service.delete_account(
            db=db,
            user_id=current_user.id,
            account_id=account_id,
        )
    except finance_account_service.FinanceAccountNotFound:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Finance account not found.",
        )

    return None