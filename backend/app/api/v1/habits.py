import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.habit import HabitFrequency
from app.models.user import User
from app.schemas.habit import (
    HabitCreate,
    HabitListResponse,
    HabitOut,
    HabitUpdate,
)
from app.services import habit_service


router = APIRouter(prefix="/habits", tags=["habits"])


@router.get("", response_model=HabitListResponse)
def list_habits(
    active_only: bool = Query(True),
    search: str | None = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    habits, total = habit_service.list_habits(
        db=db,
        user_id=current_user.id,
        active_only=active_only,
        search=search,
        page=page,
        page_size=page_size,
    )

    return HabitListResponse(
        items=habits,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=habit_service.total_pages(total, page_size),
    )


@router.post(
    "",
    response_model=HabitOut,
    status_code=status.HTTP_201_CREATED,
)
def create_habit(
    payload: HabitCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    habit = habit_service.create_habit(
        db=db,
        user_id=current_user.id,
        payload=payload,
    )

    return habit


@router.get("/{habit_id}", response_model=HabitOut)
def get_habit(
    habit_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        habit = habit_service.get_habit_or_raise(
            db=db,
            user_id=current_user.id,
            habit_id=habit_id,
        )
    except habit_service.HabitNotFound:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit not found",
        )

    return habit


@router.put("/{habit_id}", response_model=HabitOut)
def update_habit(
    habit_id: uuid.UUID,
    payload: HabitUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        habit = habit_service.update_habit(
            db=db,
            user_id=current_user.id,
            habit_id=habit_id,
            payload=payload,
        )
    except habit_service.HabitNotFound:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit not found",
        )

    return habit


@router.post("/{habit_id}/complete", response_model=HabitOut)
def complete_habit(
    habit_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        habit = habit_service.complete_habit(
            db=db,
            user_id=current_user.id,
            habit_id=habit_id,
        )
    except habit_service.HabitNotFound:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit not found",
        )

    return habit


@router.delete(
    "/{habit_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_habit(
    habit_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        habit_service.delete_habit(
            db=db,
            user_id=current_user.id,
            habit_id=habit_id,
        )
    except habit_service.HabitNotFound:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit not found",
        )

    return None

