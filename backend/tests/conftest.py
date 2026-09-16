"""
Test configuration.

Tests run against an in-memory SQLite database rather than a live
PostgreSQL instance. This keeps the suite fast and dependency-free for CI.
SQLite and Postgres differ in a few edge cases (e.g. UUID storage, some
constraint behaviors), so this suite validates application logic
(auth flow, ownership, session lifecycle) rather than Postgres-specific
behavior. Before a production deploy, also run the suite once against a
real Postgres instance:
    DATABASE_URL=postgresql+psycopg://... pytest --postgres
(see README.md "Testing" section).
"""
import os

os.environ.setdefault("SECRET_KEY", "test-secret-key-not-for-production-use-only" * 2)
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")
os.environ.setdefault("REDIS_URL", "redis://localhost:6379/15")
os.environ.setdefault("SESSION_COOKIE_SECURE", "false")

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import app.models  # noqa: F401 registers all models
from app.core.config import get_settings
from app.db.session import Base, get_db
from app.main import app as fastapi_app

get_settings.cache_clear()


@pytest.fixture()
def db_session():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def client(db_session):
    def _override_get_db():
        try:
            yield db_session
        finally:
            pass

    fastapi_app.dependency_overrides[get_db] = _override_get_db
    with TestClient(fastapi_app) as test_client:
        yield test_client
    fastapi_app.dependency_overrides.clear()
