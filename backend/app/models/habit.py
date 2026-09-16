import enum
import uuid
from datetime import date

from sqlalchemy import Boolean, Date, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base
from app.models.base import TimestampMixin, UUIDPKMixin
from app.models.types import GUID


class HabitFrequency(str, enum.Enum):
    DAILY = "daily"
    WEEKLY = "weekly"


class Habit(Base, UUIDPKMixin, TimestampMixin):
    __tablename__ = "habits"

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

    description: Mapped[str | None] = mapped_column(
        Text(),
        nullable=True,
    )

    frequency: Mapped[HabitFrequency] = mapped_column(
        Enum(
            HabitFrequency,
            name="habit_frequency",
            values_callable=lambda enum_cls: [e.value for e in enum_cls],
        ),
        default=HabitFrequency.DAILY,
        nullable=False,
        index=True,
    )

    target_per_week: Mapped[int] = mapped_column(
        Integer,
        default=7,
        nullable=False,
    )

    current_streak: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    best_streak: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    last_completed_date: Mapped[date | None] = mapped_column(
        Date(),
        nullable=True,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
        index=True,
    )

    start_date: Mapped[date | None] = mapped_column(
        Date(),
        nullable=True,
    )

