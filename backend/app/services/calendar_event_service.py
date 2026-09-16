import uuid
from datetime import datetime

from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.models.calendar_event import CalendarEvent
from app.schemas.calendar_event import (
    CalendarEventCreate,
    CalendarEventUpdate,
)


class CalendarEventNotFound(Exception):
    pass


def create_event(
    db: Session,
    user_id: uuid.UUID,
    payload: CalendarEventCreate,
) -> CalendarEvent:

    event = CalendarEvent(
        user_id=user_id,
        title=payload.title,
        description=payload.description,
        start_at=payload.start_at,
        end_at=payload.end_at,
        all_day=payload.all_day,
        location=payload.location,
        category=payload.category,
    )

    db.add(event)
    db.commit()
    db.refresh(event)

    return event


def get_event(
    db: Session,
    user_id: uuid.UUID,
    event_id: uuid.UUID,
) -> CalendarEvent:

    stmt = (
        select(CalendarEvent)
        .where(
            CalendarEvent.id == event_id,
            CalendarEvent.user_id == user_id,
        )
    )

    event = db.scalar(stmt)

    if event is None:
        raise CalendarEventNotFound()

    return event


def list_events(
    db: Session,
    user_id: uuid.UUID,
    start_at: datetime | None = None,
    end_at: datetime | None = None,
    page: int = 1,
    page_size: int = 100,
):
    conditions = [
        CalendarEvent.user_id == user_id,
    ]

    if start_at is not None:
        conditions.append(
            CalendarEvent.start_at >= start_at
        )

    if end_at is not None:
        conditions.append(
            CalendarEvent.start_at <= end_at
        )

    count_stmt = (
        select(func.count())
        .select_from(CalendarEvent)
        .where(*conditions)
    )

    total = db.scalar(count_stmt) or 0

    stmt = (
        select(CalendarEvent)
        .where(*conditions)
        .order_by(CalendarEvent.start_at.asc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )

    events = list(db.scalars(stmt).all())

    total_pages = (
        (total + page_size - 1) // page_size
        if total > 0
        else 0
    )

    return events, total, total_pages


def update_event(
    db: Session,
    user_id: uuid.UUID,
    event_id: uuid.UUID,
    payload: CalendarEventUpdate,
) -> CalendarEvent:

    event = get_event(db, user_id, event_id)

    update_data = payload.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(event, field, value)

    db.commit()
    db.refresh(event)

    return event


def delete_event(
    db: Session,
    user_id: uuid.UUID,
    event_id: uuid.UUID,
) -> None:

    event = get_event(db, user_id, event_id)

    db.delete(event)
    db.commit()
