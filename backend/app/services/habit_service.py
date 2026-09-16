import math
import uuid
from datetime import date, timedelta

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.base import utcnow
from app.models.habit import Habit, HabitFrequency
from app.schemas.habit import HabitCreate, HabitUpdate


class HabitNotFound(Exception):
    pass


def create_habit(
    db: Session,
    user_id: uuid.UUID,
    payload: HabitCreate,
) -> Habit:
    habit = Habit(
        user_id=user_id,
        name=payload.name,
        description=payload.description,
        frequency=payload.frequency,
        target_per_week=payload.target_per_week,
        start_date=payload.start_date or date.today(),
        current_streak=0,
        best_streak=0,
        is_active=True,
    )

    db.add(habit)
    db.commit()
    db.refresh(habit)

    return habit


def get_habit_or_raise(
    db: Session,
    user_id: uuid.UUID,
    habit_id: uuid.UUID,
) -> Habit:
    habit = db.execute(
        select(Habit).where(
            Habit.id == habit_id,
            Habit.user_id == user_id,
        )
    ).scalar_one_or_none()

    if habit is None:
        raise HabitNotFound()

    return habit


def update_habit(
    db: Session,
    user_id: uuid.UUID,
    habit_id: uuid.UUID,
    payload: HabitUpdate,
) -> Habit:
    habit = get_habit_or_raise(db, user_id, habit_id)

    data = payload.model_dump(exclude_unset=True)

    for field, value in data.items():
        setattr(habit, field, value)

    habit.updated_at = utcnow()

    db.commit()
    db.refresh(habit)

    return habit


def complete_habit(
    db: Session,
    user_id: uuid.UUID,
    habit_id: uuid.UUID,
) -> Habit:
    habit = get_habit_or_raise(db, user_id, habit_id)

    today = date.today()

    if habit.last_completed_date == today:
        return habit

    if habit.last_completed_date == today - timedelta(days=1):
        habit.current_streak += 1
    else:
        habit.current_streak = 1

    habit.best_streak = max(
        habit.best_streak,
        habit.current_streak,
    )

    habit.last_completed_date = today
    habit.updated_at = utcnow()

    db.commit()
    db.refresh(habit)

    return habit


def delete_habit(
    db: Session,
    user_id: uuid.UUID,
    habit_id: uuid.UUID,
) -> None:
    habit = get_habit_or_raise(db, user_id, habit_id)

    db.delete(habit)
    db.commit()


def list_habits(
    db: Session,
    user_id: uuid.UUID,
    active_only: bool = True,
    search: str | None = None,
    page: int = 1,
    page_size: int = 25,
):
    page = max(page, 1)
    page_size = min(max(page_size, 1), 100)

    query = select(Habit).where(Habit.user_id == user_id)

    if active_only:
        query = query.where(Habit.is_active.is_(True))

    if search:
        like = f"%{search.strip()}%"
        query = query.where(Habit.name.ilike(like))

    count_query = select(func.count()).select_from(
        query.subquery()
    )

    total = db.execute(count_query).scalar_one()

    query = (
        query
        .order_by(
            Habit.is_active.desc(),
            Habit.created_at.desc(),
        )
        .limit(page_size)
        .offset((page - 1) * page_size)
    )

    habits = list(
        db.execute(query).scalars().all()
    )

    return habits, total


def total_pages(total: int, page_size: int) -> int:
    return max(1, math.ceil(total / page_size))

