import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.task import TaskCreate, TaskListResponse, TaskOut, TaskUpdate
from app.services import task_service

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("", response_model=TaskListResponse)
def list_tasks(
    view: str = Query(default="all", pattern="^(all|today|upcoming|overdue|completed)$"),
    search: str | None = Query(default=None, max_length=255),
    category: str | None = Query(default=None, max_length=100),
    priority: str | None = Query(default=None, pattern="^(low|medium|high|urgent)$"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=25, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    tasks, total = task_service.list_tasks(
        db,
        user_id=current_user.id,
        view=view,
        search=search,
        category=category,
        priority=priority,
        page=page,
        page_size=page_size,
    )
    return TaskListResponse(
        items=[TaskOut.from_model(t) for t in tasks],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=task_service.total_pages(total, page_size),
    )


@router.post("", response_model=TaskOut, status_code=status.HTTP_201_CREATED)
def create_task(
    payload: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    task = task_service.create_task(db, current_user.id, payload)
    return TaskOut.from_model(task)


@router.get("/{task_id}", response_model=TaskOut)
def get_task(
    task_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        task = task_service.get_task_or_raise(db, current_user.id, task_id)
    except task_service.TaskNotFound:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found.")
    return TaskOut.from_model(task)


@router.put("/{task_id}", response_model=TaskOut)
def update_task(
    task_id: uuid.UUID,
    payload: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        task = task_service.update_task(db, current_user.id, task_id, payload)
    except task_service.TaskNotFound:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found.")
    return TaskOut.from_model(task)


@router.post("/{task_id}/complete", response_model=TaskOut)
def complete_task(
    task_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        task = task_service.complete_task(db, current_user.id, task_id)
    except task_service.TaskNotFound:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found.")
    return TaskOut.from_model(task)


@router.post("/{task_id}/restore", response_model=TaskOut)
def restore_task(
    task_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        task = task_service.restore_task(db, current_user.id, task_id)
    except task_service.TaskNotFound:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found.")
    return TaskOut.from_model(task)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        task_service.delete_task(db, current_user.id, task_id)
    except task_service.TaskNotFound:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found.")
    return None
