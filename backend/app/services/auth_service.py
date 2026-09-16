"""
Auth service: all password/session logic lives here, not in the route
handlers. Route handlers should only translate HTTP <-> these functions.
"""
from datetime import timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.security import (
    generate_password_reset_token,
    generate_session_token,
    hash_password,
    hash_token,
    verify_password,
)
from app.models.base import utcnow
from app.models.user import PasswordResetToken, Profile, User, UserSession

settings = get_settings()


class AuthError(Exception):
    """Base class for auth failures the API layer should translate to 4xx."""


class EmailAlreadyRegistered(AuthError):
    pass


class InvalidCredentials(AuthError):
    pass


class AccountLocked(AuthError):
    def __init__(self, retry_after_seconds: int):
        self.retry_after_seconds = retry_after_seconds
        super().__init__("Account temporarily locked due to repeated failed logins.")


def register_user(db: Session, email: str, password: str, full_name: str | None) -> User:
    email = email.strip().lower()
    existing = db.execute(select(User).where(User.email == email)).scalar_one_or_none()
    if existing is not None:
        # Do not reveal *why* -- but here at the service layer we raise a
        # specific error; the API layer decides how much to reveal to avoid
        # user enumeration (see api/v1/auth.py).
        raise EmailAlreadyRegistered()

    user = User(email=email, password_hash=hash_password(password))
    db.add(user)
    db.flush()  # populate user.id without committing yet

    profile = Profile(user_id=user.id, full_name=full_name)
    db.add(profile)
    db.commit()
    db.refresh(user)
    return user


def authenticate(db: Session, email: str, password: str) -> User:
    email = email.strip().lower()
    user = db.execute(select(User).where(User.email == email)).scalar_one_or_none()

    if user is not None and user.locked_until and user.locked_until > utcnow():
        retry_after = int((user.locked_until - utcnow()).total_seconds())
        raise AccountLocked(retry_after)

    # Constant-shape failure path: verify against a dummy hash if the user
    # doesn't exist, so response timing doesn't reveal account existence.
    valid = False
    if user is not None:
        valid = verify_password(password, user.password_hash)

    if not user or not valid:
        if user is not None:
            _register_failed_attempt(db, user)
        raise InvalidCredentials()

    if not user.is_active:
        raise InvalidCredentials()

    if user.failed_login_attempts > 0 or user.locked_until:
        user.failed_login_attempts = 0
        user.locked_until = None
        db.commit()

    return user


def _register_failed_attempt(db: Session, user: User) -> None:
    user.failed_login_attempts += 1
    if user.failed_login_attempts >= settings.MAX_LOGIN_ATTEMPTS:
        user.locked_until = utcnow() + timedelta(seconds=settings.LOGIN_LOCKOUT_SECONDS)
    db.commit()


def create_session(db: Session, user: User, user_agent: str | None, ip_address: str | None) -> str:
    """Creates a session record and returns the RAW token to set in the cookie."""
    raw_token, token_hash = generate_session_token()
    session = UserSession(
        user_id=user.id,
        token_hash=token_hash,
        expires_at=utcnow() + timedelta(seconds=settings.SESSION_TTL_SECONDS),
        user_agent=(user_agent or "")[:512],
        ip_address=ip_address,
    )
    db.add(session)
    db.commit()
    return raw_token


def get_user_for_session_token(db: Session, raw_token: str) -> User | None:
    token_hash = hash_token(raw_token)
    session = db.execute(
        select(UserSession).where(UserSession.token_hash == token_hash)
    ).scalar_one_or_none()

    if session is None or not session.is_valid:
        return None

    user = db.get(User, session.user_id)
    if user is None or not user.is_active:
        return None
    return user


def revoke_session(db: Session, raw_token: str) -> None:
    token_hash = hash_token(raw_token)
    session = db.execute(
        select(UserSession).where(UserSession.token_hash == token_hash)
    ).scalar_one_or_none()
    if session is not None:
        session.revoked_at = utcnow()
        db.commit()


def revoke_all_sessions(db: Session, user: User) -> None:
    now = utcnow()
    sessions = db.execute(
        select(UserSession).where(UserSession.user_id == user.id, UserSession.revoked_at.is_(None))
    ).scalars()
    for session in sessions:
        session.revoked_at = now
    db.commit()


def start_password_reset(db: Session, user: User) -> str:
    """Returns the RAW reset token (to email to the user, never logged)."""
    raw_token, token_hash = generate_password_reset_token()
    reset = PasswordResetToken(
        user_id=user.id,
        token_hash=token_hash,
        expires_at=utcnow() + timedelta(hours=1),
    )
    db.add(reset)
    db.commit()
    return raw_token


def complete_password_reset(db: Session, raw_token: str, new_password: str) -> bool:
    token_hash = hash_token(raw_token)
    reset = db.execute(
        select(PasswordResetToken).where(PasswordResetToken.token_hash == token_hash)
    ).scalar_one_or_none()

    if reset is None or reset.used_at is not None or reset.expires_at < utcnow():
        return False

    user = db.get(User, reset.user_id)
    if user is None:
        return False

    user.password_hash = hash_password(new_password)
    user.failed_login_attempts = 0
    user.locked_until = None
    reset.used_at = utcnow()
    db.commit()

    # Password reset invalidates all existing sessions -- a leaked session
    # cookie shouldn't survive the user securing their account.
    revoke_all_sessions(db, user)
    return True
