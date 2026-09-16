from fastapi import APIRouter

from app.api.v1.auth import router as auth_router
from app.api.v1.goals import router as goals_router
from app.api.v1.health import router as health_router
from app.api.v1.profile import router as profile_router
from app.api.v1.tasks import router as tasks_router
from app.api.v1.notes import router as notes_router
from app.api.v1.habits import router as habits_router
from app.api.v1.calendar_events import router as calendar_events_router
from app.api.v1.finance_accounts import router as finance_accounts_router
from app.api.v1.finance_transactions import router as finance_transactions_router
from app.api.v1.ai import router as ai_router
from app.api.v1.contact import router as contact_router


api_router = APIRouter()

api_router.include_router(health_router)
api_router.include_router(auth_router)
api_router.include_router(profile_router)
api_router.include_router(tasks_router)
api_router.include_router(goals_router)
api_router.include_router(notes_router)
api_router.include_router(habits_router)
api_router.include_router(calendar_events_router)
api_router.include_router(finance_accounts_router)
api_router.include_router(finance_transactions_router)
api_router.include_router(ai_router)
api_router.include_router(contact_router)