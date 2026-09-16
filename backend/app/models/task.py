import enum
import uuid
from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base
from app.models.base import TimestampMixin, UUIDPKMixin
from app.models.types import GUID


class TaskPriority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class TaskStatus(str, enum.Enum):
    ACTIVE = "active"
    COMPLETED = "completed"


class Task(Base, UUIDPKMixin, TimestampMixin):
    __tablename__ = "tasks"

    # Every user-owned table has a user_id, and every query in
    # task_service.py filters by it -- see app/services/task_service.py.
    user_id: Mapped[uuid.UUID] = mapped_column(
        GUID(), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text(), nullable=True)
    status: Mapped[TaskStatus] = mapped_column(
        Enum(TaskStatus, name="task_status", values_callable=lambda enum_cls: [e.value for e in enum_cls]), default=TaskStatus.ACTIVE, nullable=False, index=True
    )
    priority: Mapped[TaskPriority] = mapped_column(
        Enum(TaskPriority, name="task_priority", values_callable=lambda enum_cls: [e.value for e in enum_cls]), default=TaskPriority.MEDIUM, nullable=False
    )
    category: Mapped[str | None] = mapped_column(String(100), nullable=True)
    tags: Mapped[str | None] = mapped_column(String(500), nullable=True)  # comma-separated; simple by design

    start_date: Mapped[date | None] = mapped_column(Date(), nullable=True)
    due_date: Mapped[date | None] = mapped_column(Date(), nullable=True, index=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Simple recurrence: a cron-like/plain description of the recurrence
    # rule, interpreted by a background job (see PROGRESS.md -- recurring
    # task generation is not yet implemented, deliberately left as a
    # documented gap rather than faked).
    recurrence_rule: Mapped[str | None] = mapped_column(String(255), nullable=True)

    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)

    subtasks: Mapped[list["TaskSubtask"]] = relationship(
        back_populates="task", cascade="all, delete-orphan", order_by="TaskSubtask.sort_order"
    )


class TaskSubtask(Base, UUIDPKMixin, TimestampMixin):
    __tablename__ = "task_subtasks"

    task_id: Mapped[uuid.UUID] = mapped_column(
        GUID(), ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    task: Mapped["Task"] = relationship(back_populates="subtasks")
