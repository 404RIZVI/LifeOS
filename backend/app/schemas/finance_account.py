import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.models.finance_account import AccountType


class FinanceAccountCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    account_type: AccountType = AccountType.CASH
    balance: Decimal = Field(default=Decimal("0.00"), max_digits=12, decimal_places=2)
    description: str | None = Field(default=None, max_length=10_000)
    currency: str = Field(default="INR", min_length=3, max_length=3)


class FinanceAccountUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    account_type: AccountType | None = None
    balance: Decimal | None = Field(default=None, max_digits=12, decimal_places=2)
    description: str | None = Field(default=None, max_length=10_000)
    currency: str | None = Field(default=None, min_length=3, max_length=3)
    is_active: bool | None = None


class FinanceAccountOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    account_type: AccountType
    balance: Decimal
    description: str | None
    currency: str
    is_active: bool
    created_at: datetime
    updated_at: datetime


class FinanceAccountListResponse(BaseModel):
    items: list[FinanceAccountOut]
    total: int
    page: int
    page_size: int
    total_pages: int