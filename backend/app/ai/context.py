from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.ai_message import AIMessage


def get_conversation_messages(
    db: Session,
    conversation_id,
    limit: int = 20,
) -> list[dict[str, str]]:
    result = db.execute(
        select(AIMessage)
        .where(AIMessage.conversation_id == conversation_id)
        .order_by(AIMessage.created_at.desc())
        .limit(limit)
    )

    messages = list(result.scalars().all())

    messages.reverse()

    return [
        {
            "role": message.role,
            "content": message.content,
        }
        for message in messages
    ]