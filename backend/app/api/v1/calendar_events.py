import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.calendar_event import (
    CalendarEventCreate,
    CalendarEventListResponse,
    CalendarEventOut,
    CalendarEventUpdate,
)
from app.services import calendar_event_service


router = APIRouter(
    prefix="/calendar/events",
    tags=["calendar"],
)


@router.get("", response_model=CalendarEventListResponse)
def list_calendar_events(
    start_at: datetime | None = Query(default=None),
    end_at: datetime | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=100, ge=1, le=500),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    events, total, total_pages = calendar_event_service.list_events(
        db=db,
        user_id=current_user.id,
        start_at=start_at,
        end_at=end_at,
        page=page,
        page_size=page_size,
    )

    return CalendarEventListResponse(
        items=[
            CalendarEventOut.model_validate(event)
            for event in events
        ],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.post(
    "",
    response_model=CalendarEventOut,
    status_code=status.HTTP_201_CREATED,
)
def create_calendar_event(
    payload: CalendarEventCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if payload.end_at is not None and payload.end_at < payload.start_at:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="end_at cannot be earlier than start_at",
        )

    event = calendar_event_service.create_event(
        db=db,
        user_id=current_user.id,
        payload=payload,
    )

    return CalendarEventOut.model_validate(event)


@router.get(
    "/{event_id}",
    response_model=CalendarEventOut,
)
def get_calendar_event(
    event_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        event = calendar_event_service.get_event(
            db=db,
            user_id=current_user.id,
            event_id=event_id,
        )
    except calendar_event_service.CalendarEventNotFound:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Calendar event not found",
        )

    return CalendarEventOut.model_validate(event)


@router.put(
    "/{event_id}",
    response_model=CalendarEventOut,
)
def update_calendar_event(
    event_id: uuid.UUID,
    payload: CalendarEventUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if (
        payload.start_at is not None
        and payload.end_at is not None
        and payload.end_at < payload.start_at
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="end_at cannot be earlier than start_at",
        )

    try:
        event = calendar_event_service.update_event(
            db=db,
            user_id=current_user.id,
            event_id=event_id,
            payload=payload,
        )
    except calendar_event_service.CalendarEventNotFound:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Calendar event not found",
        )

    return CalendarEventOut.model_validate(event)


@router.delete(
    "/{event_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_calendar_event(
    event_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        calendar_event_service.delete_event(
            db=db,
            user_id=current_user.id,
            event_id=event_id,
        )
    except calendar_event_service.CalendarEventNotFound:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Calendar event not found",
        )

    return None
