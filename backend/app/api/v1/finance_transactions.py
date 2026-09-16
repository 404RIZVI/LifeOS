import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.finance_transaction import TransactionType
from app.models.user import User
from app.schemas.finance_transaction import (
    FinanceSummary,
    FinanceTransactionCreate,
    FinanceTransactionListResponse,
    FinanceTransactionOut,
    FinanceTransactionUpdate,
)
from app.services import finance_transaction_service

router = APIRouter(
    prefix="/finance/transactions",
    tags=["finance transactions"],
)


@router.get("", response_model=FinanceTransactionListResponse)
def list_transactions(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    transaction_type: TransactionType | None = None,
    category: str | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    transactions, total = finance_transaction_service.list_transactions(
        db=db,
        user_id=current_user.id,
        page=page,
        page_size=page_size,
        transaction_type=transaction_type,
        category=category,
    )

    total_pages = (total + page_size - 1) // page_size

    return FinanceTransactionListResponse(
        items=transactions,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.post(
    "",
    response_model=FinanceTransactionOut,
    status_code=status.HTTP_201_CREATED,
)
def create_transaction(
    payload: FinanceTransactionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        transaction = finance_transaction_service.create_transaction(
            db=db,
            user_id=current_user.id,
            payload=payload,
        )
    except finance_transaction_service.FinanceAccountNotFound:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Finance account not found",
        )

    return transaction


@router.get(
    "/summary",
    response_model=FinanceSummary,
)
def get_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return finance_transaction_service.calculate_finance_summary(
        db=db,
        user_id=current_user.id,
    )


@router.get(
    "/{transaction_id}",
    response_model=FinanceTransactionOut,
)
def get_transaction(
    transaction_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        return finance_transaction_service.get_transaction_or_raise(
            db=db,
            user_id=current_user.id,
            transaction_id=transaction_id,
        )
    except finance_transaction_service.FinanceTransactionNotFound:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Finance transaction not found",
        )


@router.put(
    "/{transaction_id}",
    response_model=FinanceTransactionOut,
)
def update_transaction(
    transaction_id: uuid.UUID,
    payload: FinanceTransactionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        return finance_transaction_service.update_transaction(
            db=db,
            user_id=current_user.id,
            transaction_id=transaction_id,
            payload=payload,
        )
    except finance_transaction_service.FinanceTransactionNotFound:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Finance transaction not found",
        )
    except finance_transaction_service.FinanceAccountNotFound:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Finance account not found",
        )


@router.delete(
    "/{transaction_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_transaction(
    transaction_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        finance_transaction_service.delete_transaction(
            db=db,
            user_id=current_user.id,
            transaction_id=transaction_id,
        )
    except finance_transaction_service.FinanceTransactionNotFound:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Finance transaction not found",
        )
    except finance_transaction_service.FinanceAccountNotFound:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Finance account not found",
        )

    return None