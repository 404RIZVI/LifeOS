import logging
import sys

from app.core.config import get_settings

settings = get_settings()

_SENSITIVE_KEYS = {"password", "token", "secret", "authorization", "cookie", "session"}


class RedactSensitiveFilter(logging.Filter):
    """Best-effort guard: if a log call accidentally includes a dict/kwargs
    with an obviously sensitive key, redact the value. This is defense in
    depth -- the real rule is that calling code must never pass secrets to
    the logger in the first place.
    """

    def filter(self, record: logging.LogRecord) -> bool:
        if hasattr(record, "args") and isinstance(record.args, dict):
            record.args = {
                k: ("***REDACTED***" if k.lower() in _SENSITIVE_KEYS else v)
                for k, v in record.args.items()
            }
        return True


def configure_logging() -> None:
    level = logging.DEBUG if settings.DEBUG else logging.INFO
    handler = logging.StreamHandler(sys.stdout)
    handler.addFilter(RedactSensitiveFilter())
    formatter = logging.Formatter(
        fmt="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
        datefmt="%Y-%m-%dT%H:%M:%S%z",
    )
    handler.setFormatter(formatter)

    root = logging.getLogger()
    root.setLevel(level)
    root.handlers = [handler]

    # Don't let SQLAlchemy log raw SQL (which can include parameter values)
    # at INFO in production.
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING if not settings.DEBUG else logging.INFO)
