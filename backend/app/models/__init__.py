"""
Importing this package registers every model on Base.metadata.

Alembic's env.py imports this module before autogenerating migrations.
Every model module must be imported here so its tables are included
in Base.metadata.
"""

from app.models.user import (
    PasswordResetToken,
    Profile,
    User,
    UserSession,
)

from app.models.task import (
    Task,
    TaskSubtask,
)

from app.models.goal import Goal

from app.models.habit import Habit

from app.models.calendar_event import CalendarEvent

from app.models.note import Note

from app.models.finance_account import FinanceAccount

from app.models.finance_transaction import FinanceTransaction

from app.models.ai_conversation import AIConversation

from app.models.ai_message import AIMessage


__all__ = [
    "User",
    "Profile",
    "UserSession",
    "PasswordResetToken",
    "Task",
    "TaskSubtask",
    "Goal",
    "Habit",
    "CalendarEvent",
    "Note",
    "FinanceAccount",
    "FinanceTransaction",
    "AIConversation",
    "AIMessage",
]