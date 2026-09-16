import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, String, Text, Boolean
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base
from app.models.base import TimestampMixin, UUIDPKMixin
from app.models.types import GUID


class CalendarEventCategory(str, enum.Enum):
    PERSONAL = "personal"
    WORK = "work"
    STUDY = "study"
    HEALTH = "health"
    OTHER = "other"


class CalendarEvent(Base, UUIDPKMixin, TimestampMixin):
    __tablename__ = "calendar_events"

    user_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        Text(),
        nullable=True,
    )

    start_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        index=True,
    )

    end_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    all_day: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    location: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    category: Mapped[CalendarEventCategory] = mapped_column(
        Enum(
            CalendarEventCategory,
            name="calendar_event_category",
            values_callable=lambda enum_cls: [e.value for e in enum_cls],
        ),
        default=CalendarEventCategory.PERSONAL,
        nullable=False,
        index=True,
    )