import logging

from fastapi import APIRouter, Cookie, Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.deps import get_current_user
from app.core.rate_limit import RateLimiter
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import (
    ForgotPasswordRequest,
    LoginRequest,
    RegisterRequest,
    ResetPasswordRequest,
    UserOut,
)
from app.services import auth_service
from app.services.email_service import send_password_reset_email, send_welcome_email

router = APIRouter(prefix="/auth", tags=["auth"])
_login_limiter = RateLimiter(get_settings().RATE_LIMIT_LOGIN, scope="login")
_register_limiter = RateLimiter(get_settings().RATE_LIMIT_REGISTER, scope="register")
_forgot_password_limiter = RateLimiter(get_settings().RATE_LIMIT_REGISTER, scope="forgot_password")
logger = logging.getLogger("lifeos.auth")
settings = get_settings()


def _set_session_cookie(response: Response, raw_token: str) -> None:
    response.set_cookie(
        key=settings.SESSION_COOKIE_NAME,
        value=raw_token,
        max_age=settings.SESSION_TTL_SECONDS,
        httponly=True,
        secure=settings.SESSION_COOKIE_SECURE,
        samesite=settings.SESSION_COOKIE_SAMESITE,
        path="/",
    )


def _clear_session_cookie(response: Response) -> None:
    response.delete_cookie(key=settings.SESSION_COOKIE_NAME, path="/")


@router.post(
    "/register",
    response_model=UserOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(_register_limiter)],
)
def register(payload: RegisterRequest, request: Request, response: Response, db: Session = Depends(get_db)):
    try:
        user = auth_service.register_user(db, payload.email, payload.password, payload.full_name)
    except auth_service.EmailAlreadyRegistered:
        # Deliberately vague to avoid confirming which emails are registered
        # via the registration endpoint; login errors are similarly vague.
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Could not create account with the provided details.",
        )

    raw_token = auth_service.create_session(
        db, user, user_agent=request.headers.get("user-agent"), ip_address=request.client.host if request.client else None
    )
    _set_session_cookie(response, raw_token)

    if settings.email_configured:
        send_welcome_email(user.email)
    else:
        logger.info("Email not configured -- skipping welcome email for %s", user.id)

    return user


@router.post("/login", response_model=UserOut, dependencies=[Depends(_login_limiter)])
def login(payload: LoginRequest, request: Request, response: Response, db: Session = Depends(get_db)):
    try:
        user = auth_service.authenticate(db, payload.email, payload.password)
    except auth_service.AccountLocked as e:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many failed attempts. Try again in {e.retry_after_seconds} seconds.",
        )
    except auth_service.InvalidCredentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password.")

    raw_token = auth_service.create_session(
        db, user, user_agent=request.headers.get("user-agent"), ip_address=request.client.host if request.client else None
    )
    _set_session_cookie(response, raw_token)
    return user


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(
    response: Response,
    db: Session = Depends(get_db),
    lifeos_session: str | None = Cookie(default=None),
):
    if lifeos_session:
        auth_service.revoke_session(db, lifeos_session)
    _clear_session_cookie(response)
    return None


@router.post("/logout-all", status_code=status.HTTP_204_NO_CONTENT)
def logout_all(
    response: Response,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    auth_service.revoke_all_sessions(db, current_user)
    _clear_session_cookie(response)
    return None


@router.post(
    "/forgot-password",
    status_code=status.HTTP_202_ACCEPTED,
    dependencies=[Depends(_forgot_password_limiter)],
)
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    from sqlalchemy import select

    user = db.execute(select(User).where(User.email == payload.email.lower())).scalar_one_or_none()
    if user is not None:
        raw_token = auth_service.start_password_reset(db, user)
        if settings.email_configured:
            send_password_reset_email(user.email, raw_token)
        else:
            logger.warning(
                "EMAIL NOT CONFIGURED: password reset token for %s would have been emailed. "
                "Set EMAIL_HOST/EMAIL_USERNAME/EMAIL_PASSWORD to enable delivery.",
                user.id,
            )
    # Always return the same response whether or not the email exists --
    # this prevents attackers from using this endpoint to enumerate accounts.
    return {"message": "If that email is registered, a reset link has been sent."}


@router.post("/reset-password", status_code=status.HTTP_200_OK)
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    ok = auth_service.complete_password_reset(db, payload.token, payload.new_password)
    if not ok:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired reset token.")
    return {"message": "Password has been reset. Please log in again."}


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user
