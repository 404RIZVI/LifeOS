
import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class NoteCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    content: str | None = Field(default=None, max_length=100_000)
    category: str | None = Field(default=None, max_length=100)
    tags: list[str] = Field(default_factory=list)


class NoteUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    content: str | None = Field(default=None, max_length=100_000)
    category: str | None = Field(default=None, max_length=100)
    tags: list[str] | None = None


class NoteOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    content: str | None
    category: str | None
    tags: list[str]
    created_at: datetime
    updated_at: datetime


class NoteListResponse(BaseModel):
    items: list[NoteOut]
    total: int
    page: int
    page_size: int
    total_pages: int