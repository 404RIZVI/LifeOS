import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.calendar_event import CalendarEventCategory


class CalendarEventCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=10_000)
    start_at: datetime
    end_at: datetime | None = None
    all_day: bool = False
    location: str | None = Field(default=None, max_length=255)
    category: CalendarEventCategory = CalendarEventCategory.PERSONAL


class CalendarEventUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=10_000)
    start_at: datetime | None = None
    end_at: datetime | None = None
    all_day: bool | None = None
    location: str | None = Field(default=None, max_length=255)
    category: CalendarEventCategory | None = None


class CalendarEventOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    description: str | None
    start_at: datetime
    end_at: datetime | None
    all_day: bool
    location: str | None
    category: CalendarEventCategory
    created_at: datetime
    updated_at: datetime


class CalendarEventListResponse(BaseModel):
    items: list[CalendarEventOut]
    total: int
    page: int
    page_size: int
    total_pages: int
