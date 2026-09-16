import math
import uuid

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.base import utcnow
from app.models.goal import Goal, GoalStatus
from app.schemas.goal import GoalCreate, GoalUpdate


class GoalNotFound(Exception):
    pass


def create_goal(db: Session, user_id: uuid.UUID, payload: GoalCreate) -> Goal:
    goal = Goal(
        user_id=user_id,
        title=payload.title,
        description=payload.description,
        category=payload.category,
        progress=payload.progress,
        start_date=payload.start_date,
        target_date=payload.target_date,
        status=GoalStatus.COMPLETED if payload.progress == 100 else GoalStatus.ACTIVE,
    )

    db.add(goal)
    db.commit()
    db.refresh(goal)

    return goal


def get_goal_or_raise(
    db: Session,
    user_id: uuid.UUID,
    goal_id: uuid.UUID,
) -> Goal:
    goal = db.execute(
        select(Goal).where(
            Goal.id == goal_id,
            Goal.user_id == user_id,
        )
    ).scalar_one_or_none()

    if goal is None:
        raise GoalNotFound()

    return goal


def update_goal(
    db: Session,
    user_id: uuid.UUID,
    goal_id: uuid.UUID,
    payload: GoalUpdate,
) -> Goal:
    goal = get_goal_or_raise(db, user_id, goal_id)

    data = payload.model_dump(exclude_unset=True)

    for field, value in data.items():
        setattr(goal, field, value)

    if "progress" in data and data["progress"] is not None:
        if data["progress"] == 100:
            goal.status = GoalStatus.COMPLETED
        elif goal.status == GoalStatus.COMPLETED:
            goal.status = GoalStatus.ACTIVE

    goal.updated_at = utcnow()

    db.commit()
    db.refresh(goal)

    return goal


def complete_goal(
    db: Session,
    user_id: uuid.UUID,
    goal_id: uuid.UUID,
) -> Goal:
    goal = get_goal_or_raise(db, user_id, goal_id)

    goal.progress = 100
    goal.status = GoalStatus.COMPLETED
    goal.updated_at = utcnow()

    db.commit()
    db.refresh(goal)

    return goal


def delete_goal(
    db: Session,
    user_id: uuid.UUID,
    goal_id: uuid.UUID,
) -> None:
    goal = get_goal_or_raise(db, user_id, goal_id)

    db.delete(goal)
    db.commit()


def list_goals(
    db: Session,
    user_id: uuid.UUID,
    status: str | None = None,
    search: str | None = None,
    category: str | None = None,
    page: int = 1,
    page_size: int = 25,
) -> tuple[list[Goal], int]:
    page = max(page, 1)
    page_size = min(max(page_size, 1), 100)

    query = select(Goal).where(Goal.user_id == user_id)

    if status:
        query = query.where(Goal.status == status)

    if search:
        like = f"%{search.strip()}%"
        query = query.where(Goal.title.ilike(like))

    if category:
        query = query.where(Goal.category == category)

    count_query = select(func.count()).select_from(query.subquery())
    total = db.execute(count_query).scalar_one()

    query = query.order_by(
        Goal.target_date.asc().nulls_last(),
        Goal.created_at.desc(),
    ).limit(page_size).offset(
        (page - 1) * page_size
    )

    goals = list(db.execute(query).scalars().all())

    return goals, total


def total_pages(total: int, page_size: int) -> int:
    return max(1, math.ceil(total / page_size))
