"""
FastAPI dependencies.

`get_current_user` is the single choke point that every protected route
depends on. It is the ONLY place session cookies are read and translated
into an authenticated User. No route handler should ever trust a
user_id/email passed in the request body or query string for
authorization -- authorization always comes from this dependency, derived
solely from the session cookie.

Note: the cookie parameter name below (`lifeos_session`) must match
Settings.SESSION_COOKIE_NAME. FastAPI's Cookie() requires a static
parameter name, so this is asserted at import time rather than read from
settings dynamically.
"""
from fastapi import Cookie, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db.session import get_db
from app.models.user import User
from app.services.auth_service import get_user_for_session_token

settings = get_settings()

assert settings.SESSION_COOKIE_NAME == "lifeos_session", (
    "SESSION_COOKIE_NAME changed in config but not in app/core/deps.py -- "
    "update the `lifeos_session` Cookie() parameters below to match."
)


async def get_current_user(
    db: Session = Depends(get_db),
    lifeos_session: str | None = Cookie(default=None),
) -> User:
    """Raises 401 if there is no valid session. Use for protected routes."""
    if not lifeos_session:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    user = get_user_for_session_token(db, lifeos_session)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session expired or invalid")

    return user


async def get_optional_user(
    db: Session = Depends(get_db),
    lifeos_session: str | None = Cookie(default=None),
) -> User | None:
    """Returns None instead of raising. Use for routes usable logged-out (e.g. public pages needing personalization)."""
    if not lifeos_session:
        return None
    return get_user_for_session_token(db, lifeos_session)
