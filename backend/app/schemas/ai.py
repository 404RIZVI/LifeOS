from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class AIMessageCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=20000)


class AIMessageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    conversation_id: UUID
    role: str
    content: str
    created_at: datetime


class AIConversationCreate(BaseModel):
    title: str = Field(
        default="New conversation",
        min_length=1,
        max_length=255,
    )


class AIConversationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    title: str
    last_message_at: datetime | None
    created_at: datetime
    updated_at: datetime


class AIChatRequest(BaseModel):
    conversation_id: UUID | None = None
    message: str = Field(
        ...,
        min_length=1,
        max_length=20000,
    )


class AIChatResponse(BaseModel):
    conversation_id: UUID
    message: AIMessageOut