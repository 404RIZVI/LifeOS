"""
Email service.

If EMAIL_HOST/EMAIL_USERNAME/EMAIL_PASSWORD are not set, we do NOT pretend
to send email. Callers check `settings.email_configured` first (see
api/v1/auth.py) and log a clear warning instead. This module raises loudly
if called while unconfigured, rather than silently no-op-ing, so a
misconfigured production deployment fails fast instead of quietly losing
password-reset emails.
"""
import logging
import smtplib
from email.message import EmailMessage

from app.core.config import get_settings

logger = logging.getLogger("lifeos.email")
settings = get_settings()


class EmailNotConfigured(RuntimeError):
    pass


def _send(to_email: str, subject: str, body: str) -> None:
    if not settings.email_configured:
        raise EmailNotConfigured(
            "EMAIL_HOST/EMAIL_USERNAME/EMAIL_PASSWORD are not set. "
            "Configure them in .env before calling send functions, or "
            "check settings.email_configured before calling."
        )

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = settings.EMAIL_FROM
    msg["To"] = to_email
    msg.set_content(body)

    with smtplib.SMTP(settings.EMAIL_HOST, settings.EMAIL_PORT or 587) as smtp:
        smtp.starttls()
        smtp.login(settings.EMAIL_USERNAME, settings.EMAIL_PASSWORD)
        smtp.send_message(msg)

    logger.info("Sent email '%s' to %s", subject, to_email)


def send_welcome_email(to_email: str) -> None:
    _send(
        to_email,
        subject="Welcome to LifeOS",
        body="Your LifeOS account is ready. Log in to set up your dashboard.",
    )


def send_password_reset_email(to_email: str, raw_reset_token: str) -> None:
    reset_url = f"{settings.FRONTEND_URL}/auth/reset-password?token={raw_reset_token}"
    _send(
        to_email,
        subject="Reset your LifeOS password",
        body=(
            "We received a request to reset your LifeOS password. "
            f"This link expires in 1 hour: {reset_url}\n\n"
            "If you did not request this, you can safely ignore this email."
        ),
    )
