import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.task import TaskPriority, TaskStatus


class SubtaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)


class SubtaskOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    is_completed: bool
    sort_order: int


class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=10_000)
    priority: TaskPriority = TaskPriority.MEDIUM
    category: str | None = Field(default=None, max_length=100)
    tags: list[str] = Field(default_factory=list)
    start_date: date | None = None
    due_date: date | None = None
    recurrence_rule: str | None = Field(default=None, max_length=255)
    subtasks: list[SubtaskCreate] = Field(default_factory=list)


class TaskUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=10_000)
    priority: TaskPriority | None = None
    category: str | None = Field(default=None, max_length=100)
    tags: list[str] | None = None
    start_date: date | None = None
    due_date: date | None = None
    recurrence_rule: str | None = Field(default=None, max_length=255)


class TaskOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    description: str | None
    status: TaskStatus
    priority: TaskPriority
    category: str | None
    tags: list[str]
    start_date: date | None
    due_date: date | None
    completed_at: datetime | None
    recurrence_rule: str | None
    subtasks: list[SubtaskOut]
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_model(cls, task) -> "TaskOut":
        tag_list = task.tags.split(",") if task.tags else []
        return cls(
            id=task.id,
            title=task.title,
            description=task.description,
            status=task.status,
            priority=task.priority,
            category=task.category,
            tags=tag_list,
            start_date=task.start_date,
            due_date=task.due_date,
            completed_at=task.completed_at,
            recurrence_rule=task.recurrence_rule,
            subtasks=[SubtaskOut.model_validate(s) for s in task.subtasks],
            created_at=task.created_at,
            updated_at=task.updated_at,
        )


class TaskListResponse(BaseModel):
    items: list[TaskOut]
    total: int
    page: int
    page_size: int
    total_pages: int
