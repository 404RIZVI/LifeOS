import os
import smtplib
from email.message import EmailMessage


def send_contact_email(
    name: str,
    email: str,
    message: str,
) -> None:
    host = os.getenv("EMAIL_HOST")
    port = os.getenv("EMAIL_PORT")
    username = os.getenv("EMAIL_USERNAME")
    password = os.getenv("EMAIL_PASSWORD")
    email_from = os.getenv("EMAIL_FROM")

    if not all([host, port, username, password, email_from]):
        raise RuntimeError("Email service is not configured.")

    msg = EmailMessage()

    msg["Subject"] = f"LifeOS Contact Message from {name}"
    msg["From"] = email_from
    msg["To"] = email_from
    msg["Reply-To"] = email

    msg.set_content(
        f"""New message received through the LifeOS contact form.

Name: {name}
Email: {email}

Message:
{message}
"""
    )

    try:
        with smtplib.SMTP(host, int(port), timeout=30) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(username, password)
            server.send_message(msg)

    except smtplib.SMTPException as exc:
        print(f"EMAIL SMTP ERROR: {type(exc).__name__}: {exc}")
        raise RuntimeError("Unable to send contact email.") from exc