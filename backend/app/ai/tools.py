from typing import Any


def get_available_tools() -> list[dict[str, Any]]:
    return [
        {
            "name": "get_tasks",
            "description": "Get the user's tasks from LifeOS.",
        },
        {
            "name": "create_task",
            "description": "Create a new task in LifeOS.",
        },
        {
            "name": "complete_task",
            "description": "Complete an existing LifeOS task.",
        },
        {
            "name": "get_goals",
            "description": "Get the user's goals.",
        },
        {
            "name": "create_goal",
            "description": "Create a new goal.",
        },
        {
            "name": "get_habits",
            "description": "Get the user's habits.",
        },
        {
            "name": "complete_habit",
            "description": "Record completion of a habit.",
        },
        {
            "name": "get_calendar_events",
            "description": "Get the user's calendar events.",
        },
        {
            "name": "create_calendar_event",
            "description": "Create a calendar event.",
        },
        {
            "name": "get_notes",
            "description": "Get the user's notes.",
        },
        {
            "name": "create_note",
            "description": "Create a note.",
        },
        {
            "name": "get_finance_summary",
            "description": "Get the user's finance summary.",
        },
        {
            "name": "get_transactions",
            "description": "Get the user's finance transactions.",
        },
    ]