from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.ai.context import get_conversation_messages
from app.ai.service import ollama_service
from app.db.session import get_db
from app.models.ai_conversation import AIConversation
from app.models.ai_message import AIMessage
from app.models.user import User
from app.schemas.ai import (
    AIChatRequest,
    AIChatResponse,
    AIConversationCreate,
    AIConversationOut,
    AIMessageOut,
)
from app.core.deps import get_current_user


router = APIRouter(prefix="/ai", tags=["AI"])


# ============================================================
# CREATE CONVERSATION
# ============================================================

@router.post(
    "/conversations",
    response_model=AIConversationOut,
    status_code=status.HTTP_201_CREATED,
)
def create_conversation(
    data: AIConversationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    conversation = AIConversation(
        user_id=current_user.id,
        title=data.title,
    )

    db.add(conversation)
    db.commit()
    db.refresh(conversation)

    return conversation


# ============================================================
# LIST CONVERSATIONS
# ============================================================

@router.get(
    "/conversations",
    response_model=list[AIConversationOut],
)
def list_conversations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = db.execute(
        select(AIConversation)
        .where(AIConversation.user_id == current_user.id)
        .order_by(AIConversation.updated_at.desc())
    )

    return result.scalars().all()


# ============================================================
# GET CONVERSATION MESSAGES
# ============================================================

@router.get(
    "/conversations/{conversation_id}/messages",
    response_model=list[AIMessageOut],
)
def list_messages(
    conversation_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # First verify that this conversation belongs to the user.
    result = db.execute(
        select(AIConversation).where(
            AIConversation.id == conversation_id,
            AIConversation.user_id == current_user.id,
        )
    )

    conversation = result.scalar_one_or_none()

    if conversation is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found.",
        )

    result = db.execute(
        select(AIMessage)
        .where(AIMessage.conversation_id == conversation_id)
        .order_by(AIMessage.created_at.asc())
    )

    return result.scalars().all()


# ============================================================
# CHAT WITH LIFEOS AI
# ============================================================

@router.post(
    "/chat",
    response_model=AIChatResponse,
)
def chat(
    data: AIChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    conversation = None

    # --------------------------------------------------------
    # Existing conversation
    # --------------------------------------------------------

    if data.conversation_id:
        result = db.execute(
            select(AIConversation).where(
                AIConversation.id == data.conversation_id,
                AIConversation.user_id == current_user.id,
            )
        )

        conversation = result.scalar_one_or_none()

        if conversation is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found.",
            )

    # --------------------------------------------------------
    # Create new conversation if needed
    # --------------------------------------------------------

    if conversation is None:
        conversation = AIConversation(
            user_id=current_user.id,
            title=data.message[:80],
        )

        db.add(conversation)
        db.commit()
        db.refresh(conversation)

    # --------------------------------------------------------
    # Save user message
    # --------------------------------------------------------

    user_message = AIMessage(
        conversation_id=conversation.id,
        role="user",
        content=data.message,
    )

    db.add(user_message)
    db.commit()
    db.refresh(user_message)

    # --------------------------------------------------------
    # Get conversation history
    # --------------------------------------------------------

    try:
        history = get_conversation_messages(
            db,
            conversation.id,
            limit=20,
        )
    except Exception:
        # Fallback if context helper has not yet been converted
        # to synchronous SQLAlchemy.
        result = db.execute(
            select(AIMessage)
            .where(AIMessage.conversation_id == conversation.id)
            .order_by(AIMessage.created_at.desc())
            .limit(20)
        )

        messages = list(reversed(result.scalars().all()))

        history = [
            {
                "role": message.role,
                "content": message.content,
            }
            for message in messages
        ]

    # --------------------------------------------------------
    # Ask Ollama
    # --------------------------------------------------------

    try:
        ai_content = ollama_service.chat_sync(history)

    except AttributeError:
        # Temporary compatibility fallback.
        # If service.py currently only has async chat(),
        # this will be handled after we align service.py.
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ollama service is not yet configured for the current LifeOS backend.",
        )

    except Exception as exc:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Ollama request failed: {exc}",
        ) from exc

    # --------------------------------------------------------
    # Save AI response
    # --------------------------------------------------------

    assistant_message = AIMessage(
        conversation_id=conversation.id,
        role="assistant",
        content=ai_content,
    )

    db.add(assistant_message)

    conversation.last_message_at = assistant_message.created_at

    db.commit()
    db.refresh(assistant_message)
    db.refresh(conversation)

    return AIChatResponse(
        conversation_id=conversation.id,
        message=assistant_message,
    )