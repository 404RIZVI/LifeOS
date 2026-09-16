import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.goal import GoalStatus


class GoalCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=10_000)
    category: str | None = Field(default=None, max_length=100)
    progress: int = Field(default=0, ge=0, le=100)
    start_date: date | None = None
    target_date: date | None = None


class GoalUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=10_000)
    category: str | None = Field(default=None, max_length=100)
    progress: int | None = Field(default=None, ge=0, le=100)
    start_date: date | None = None
    target_date: date | None = None
    status: GoalStatus | None = None


class GoalOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    description: str | None
    status: GoalStatus
    progress: int
    category: str | None
    start_date: date | None
    target_date: date | None
    created_at: datetime
    updated_at: datetime


class GoalListResponse(BaseModel):
    items: list[GoalOut]
    total: int
    page: int
    page_size: int
    total_pages: int
