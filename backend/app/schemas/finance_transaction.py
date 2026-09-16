import uuid
from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.models.finance_transaction import TransactionType


class FinanceTransactionCreate(BaseModel):
    account_id: uuid.UUID
    transaction_type: TransactionType
    title: str = Field(..., min_length=1, max_length=255)
    amount: Decimal = Field(..., gt=0, max_digits=12, decimal_places=2)
    category: str = Field(..., min_length=1, max_length=100)
    description: str | None = Field(default=None, max_length=10_000)
    transaction_date: date


class FinanceTransactionUpdate(BaseModel):
    account_id: uuid.UUID | None = None
    transaction_type: TransactionType | None = None
    title: str | None = Field(default=None, min_length=1, max_length=255)
    amount: Decimal | None = Field(
        default=None,
        gt=0,
        max_digits=12,
        decimal_places=2,
    )
    category: str | None = Field(default=None, min_length=1, max_length=100)
    description: str | None = Field(default=None, max_length=10_000)
    transaction_date: date | None = None


class FinanceTransactionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    account_id: uuid.UUID
    transaction_type: TransactionType
    title: str
    amount: Decimal
    category: str
    description: str | None
    transaction_date: date
    created_at: datetime
    updated_at: datetime


class FinanceTransactionListResponse(BaseModel):
    items: list[FinanceTransactionOut]
    total: int
    page: int
    page_size: int
    total_pages: int


class FinanceSummary(BaseModel):
    total_income: Decimal
    total_expense: Decimal
    net_balance: Decimal