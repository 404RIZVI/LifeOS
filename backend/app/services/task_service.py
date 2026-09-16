"""
Task service.

CRITICAL INVARIANT: every function here takes the authenticated `user_id`
and filters/verifies against it. No function accepts a task_id without
also requiring the owning user_id -- this is what prevents User A from
reading, editing, or deleting User B's task by guessing/incrementing an
ID (see app/models/task.py for why IDs are UUIDs too, as defense in
depth on top of this).
"""
import math
import uuid
from datetime import date, datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.base import utcnow
from app.models.task import Task, TaskStatus, TaskSubtask
from app.schemas.task import TaskCreate, TaskUpdate


class TaskNotFound(Exception):
    pass


def _tags_to_str(tags: list[str] | None) -> str | None:
    if not tags:
        return None
    cleaned = [t.strip() for t in tags if t.strip()]
    return ",".join(cleaned) if cleaned else None


def create_task(db: Session, user_id: uuid.UUID, payload: TaskCreate) -> Task:
    task = Task(
        user_id=user_id,
        title=payload.title,
        description=payload.description,
        priority=payload.priority,
        category=payload.category,
        tags=_tags_to_str(payload.tags),
        start_date=payload.start_date,
        due_date=payload.due_date,
        recurrence_rule=payload.recurrence_rule,
    )
    db.add(task)
    db.flush()

    for i, subtask in enumerate(payload.subtasks):
        db.add(TaskSubtask(task_id=task.id, title=subtask.title, sort_order=i))

    db.commit()
    db.refresh(task)
    return task


def get_task_or_raise(db: Session, user_id: uuid.UUID, task_id: uuid.UUID) -> Task:
    """The ownership check lives HERE, in one place, so every route that
    reads/updates/deletes a single task goes through it -- the filter is
    `Task.id == task_id AND Task.user_id == user_id` in the same query,
    not a separate "does this belong to them" check after the fact.
    """
    task = db.execute(
        select(Task).where(Task.id == task_id, Task.user_id == user_id, Task.is_deleted.is_(False))
    ).scalar_one_or_none()
    if task is None:
        raise TaskNotFound()
    return task


def update_task(db: Session, user_id: uuid.UUID, task_id: uuid.UUID, payload: TaskUpdate) -> Task:
    task = get_task_or_raise(db, user_id, task_id)

    data = payload.model_dump(exclude_unset=True)
    if "tags" in data:
        data["tags"] = _tags_to_str(data["tags"])

    for field, value in data.items():
        setattr(task, field, value)

    db.commit()
    db.refresh(task)
    return task


def complete_task(db: Session, user_id: uuid.UUID, task_id: uuid.UUID) -> Task:
    task = get_task_or_raise(db, user_id, task_id)
    task.status = TaskStatus.COMPLETED
    task.completed_at = utcnow()
    db.commit()
    db.refresh(task)
    return task


def restore_task(db: Session, user_id: uuid.UUID, task_id: uuid.UUID) -> Task:
    """Un-complete a completed task."""
    task = get_task_or_raise(db, user_id, task_id)
    task.status = TaskStatus.ACTIVE
    task.completed_at = None
    db.commit()
    db.refresh(task)
    return task


def delete_task(db: Session, user_id: uuid.UUID, task_id: uuid.UUID) -> None:
    """Soft delete -- keeps history/analytics accurate, recoverable if the
    delete was accidental. A hard-delete admin/GDPR path belongs in account
    deletion (Phase 33: Privacy), not here.
    """
    task = get_task_or_raise(db, user_id, task_id)
    task.is_deleted = True
    db.commit()


VALID_VIEWS = {"all", "today", "upcoming", "overdue", "completed"}


def list_tasks(
    db: Session,
    user_id: uuid.UUID,
    view: str = "all",
    search: str | None = None,
    category: str | None = None,
    priority: str | None = None,
    page: int = 1,
    page_size: int = 25,
) -> tuple[list[Task], int]:
    page = max(page, 1)
    page_size = min(max(page_size, 1), 100)  # hard cap: never let a client force-load thousands of rows

    query = select(Task).where(Task.user_id == user_id, Task.is_deleted.is_(False))
    today = datetime.now(timezone.utc).date()

    if view == "today":
        query = query.where(Task.status == "active", Task.due_date == today)
    elif view == "upcoming":
        query = query.where(Task.status == "active", Task.due_date > today)
    elif view == "overdue":
        query = query.where(Task.status == "active", Task.due_date < today)
    elif view == "completed":
        query = query.where(Task.status == "completed")
    else:
        query = query.where(Task.status == "active")

    if search:
        like = f"%{search.strip()}%"
        # .ilike() is a generic SQLAlchemy operator: Postgres compiles it to
        # native ILIKE, other dialects (e.g. SQLite in tests) get a
        # case-insensitive LIKE emulation -- same behavior either way.
        query = query.where(Task.title.ilike(like))

    if category:
        query = query.where(Task.category == category)

    if priority:
        query = query.where(Task.priority == priority)

    count_query = select(func.count()).select_from(query.subquery())
    total = db.execute(count_query).scalar_one()

    query = query.order_by(Task.due_date.asc().nulls_last(), Task.sort_order.asc()).limit(page_size).offset(
        (page - 1) * page_size
    )
    tasks = list(db.execute(query).scalars().all())

    return tasks, total


def total_pages(total: int, page_size: int) -> int:
    return max(1, math.ceil(total / page_size))
