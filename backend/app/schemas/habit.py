import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.habit import HabitFrequency


class HabitCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=10_000)
    frequency: HabitFrequency = HabitFrequency.DAILY
    target_per_week: int = Field(default=7, ge=1, le=7)
    start_date: date | None = None


class HabitUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=10_000)
    frequency: HabitFrequency | None = None
    target_per_week: int | None = Field(default=None, ge=1, le=7)
    start_date: date | None = None
    is_active: bool | None = None


class HabitOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    description: str | None
    frequency: HabitFrequency
    target_per_week: int
    current_streak: int
    best_streak: int
    last_completed_date: date | None
    is_active: bool
    start_date: date | None
    created_at: datetime
    updated_at: datetime


class HabitListResponse(BaseModel):
    items: list[HabitOut]
    total: int
    page: int
    page_size: int
    total_pages: int
