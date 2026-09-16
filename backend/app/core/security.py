"""
Security primitives: password hashing and session token generation.

Design decisions:
- Passwords are hashed with bcrypt (via passlib), never stored in plaintext,
  never logged.
- Sessions are server-side: we generate a high-entropy random token, store
  only its SHA-256 hash in the database (so a DB leak alone doesn't hand out
  live sessions), and set the raw token in an HttpOnly/Secure/SameSite
  cookie. This is deliberately NOT a stateless JWT -- it lets us revoke
  individual sessions or all sessions for a user instantly (logout,
  password reset, "log out everywhere"), which a stateless JWT cannot do
  without an extra revocation list anyway.
"""
import hashlib
import hmac
import secrets

from passlib.context import CryptContext

_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SESSION_TOKEN_BYTES = 32  # 256 bits of entropy
PASSWORD_RESET_TOKEN_BYTES = 32


def hash_password(plain_password: str) -> str:
    return _pwd_context.hash(plain_password)


def verify_password(plain_password: str, password_hash: str) -> bool:
    return _pwd_context.verify(plain_password, password_hash)


def generate_session_token() -> tuple[str, str]:
    """Returns (raw_token_for_cookie, sha256_hash_for_db)."""
    raw = secrets.token_urlsafe(SESSION_TOKEN_BYTES)
    return raw, hash_token(raw)


def hash_token(raw_token: str) -> str:
    return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()


def constant_time_compare(a: str, b: str) -> bool:
    return hmac.compare_digest(a, b)


def generate_password_reset_token() -> tuple[str, str]:
    raw = secrets.token_urlsafe(PASSWORD_RESET_TOKEN_BYTES)
    return raw, hash_token(raw)


PASSWORD_MIN_LENGTH = 10


def validate_password_strength(password: str) -> list[str]:
    """Returns a list of human-readable problems; empty list = valid."""
    problems: list[str] = []
    if len(password) < PASSWORD_MIN_LENGTH:
        problems.append(f"Password must be at least {PASSWORD_MIN_LENGTH} characters.")
    if not any(c.isupper() for c in password):
        problems.append("Password must contain at least one uppercase letter.")
    if not any(c.islower() for c in password):
        problems.append("Password must contain at least one lowercase letter.")
    if not any(c.isdigit() for c in password):
        problems.append("Password must contain at least one digit.")
    return problems
