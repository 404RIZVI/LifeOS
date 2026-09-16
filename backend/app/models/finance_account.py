import enum
import uuid
from decimal import Decimal

from sqlalchemy import Enum, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base
from app.models.base import TimestampMixin, UUIDPKMixin
from app.models.types import GUID


class AccountType(str, enum.Enum):
    CASH = "cash"
    BANK = "bank"
    WALLET = "wallet"
    CREDIT_CARD = "credit_card"
    OTHER = "other"


class FinanceAccount(Base, UUIDPKMixin, TimestampMixin):
    __tablename__ = "finance_accounts"

    user_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    account_type: Mapped[AccountType] = mapped_column(
        Enum(
            AccountType,
            name="finance_account_type",
            values_callable=lambda enum_cls: [e.value for e in enum_cls],
        ),
        default=AccountType.CASH,
        nullable=False,
        index=True,
    )

    balance: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        default=0,
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        Text(),
        nullable=True,
    )

    currency: Mapped[str] = mapped_column(
        String(3),
        default="INR",
        nullable=False,
    )

    is_active: Mapped[bool] = mapped_column(
        default=True,
        nullable=False,
        index=True,
    )