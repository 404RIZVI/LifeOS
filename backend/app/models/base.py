import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime
from sqlalchemy.orm import Mapped, mapped_column

from app.models.types import GUID


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class UUIDPKMixin:
    """Every table uses a UUID primary key -- non-sequential, non-guessable.

    This matters for authorization: an attacker who can view one of their
    own record IDs (e.g. /tasks/17) should never be able to enumerate other
    users' records by incrementing an integer ID. UUIDs remove that
    incentive entirely (though ownership checks are still enforced on every
    query regardless -- this is defense in depth, not the only control).
    """

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False
    )
