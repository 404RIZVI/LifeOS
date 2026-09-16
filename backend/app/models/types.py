"""
Cross-dialect UUID type.

Production always runs on PostgreSQL, which has a native UUID type. The
test suite runs against SQLite for speed (see tests/conftest.py), and
SQLite has no native UUID type. This TypeDecorator stores a real UUID
column on Postgres and a 32-char hex string on SQLite, transparently, so
model code (and every ownership check in the app) can just use
`uuid.UUID` values regardless of which database is underneath.
"""
import uuid

from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.types import CHAR, TypeDecorator


class GUID(TypeDecorator):
    impl = CHAR
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql":
            return dialect.type_descriptor(PG_UUID(as_uuid=True))
        return dialect.type_descriptor(CHAR(32))

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        if dialect.name == "postgresql":
            return str(value)
        if not isinstance(value, uuid.UUID):
            value = uuid.UUID(value)
        return value.hex

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        if isinstance(value, uuid.UUID):
            return value
        return uuid.UUID(value)
