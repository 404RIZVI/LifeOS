# LifeOS

A personal operating system: tasks, goals, habits, calendar, study, finance,
career, notes, decisions, notifications, analytics, an AI assistant, and a
voice interface, all scoped per authenticated user.

**Build status:** foundation + auth + profile + tasks are implemented and
real. Everything else in the full spec is tracked honestly in
[`PROGRESS.md`](./PROGRESS.md) — nothing is faked or stubbed silently.

## Tech stack

- **Backend:** Python, FastAPI, SQLAlchemy 2.0, Alembic, PostgreSQL, Redis
- **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS
- **Auth:** server-side sessions, HttpOnly/Secure/SameSite cookies, bcrypt
- **Infra:** Docker Compose (app + Postgres + Redis)

## Known limitations of this checkpoint

This project was built in a sandboxed environment with **no internet
access**, so:

- `pip install` / `npm install` could not be run — dependencies are
  correctly declared in `requirements.txt` / `package.json` but not
  installed or executed here.
- The test suite in `backend/tests/` is written (including the cross-user
  data isolation tests) but **has not been executed**. Run it yourself
  before deploying (see "Testing" below).
- `alembic revision --autogenerate` could not run; `0001_initial_auth_schema.py`
  was hand-written directly against the SQLAlchemy models instead. Verify
  it against your actual Postgres instance with `alembic upgrade head`
  before trusting it in production, and use `--autogenerate` for every
  migration after this one.
- The frontend has not been built or type-checked (`tsc`, `next build`).

None of this was silently skipped — see `PROGRESS.md` for the full,
itemized status against the original spec.

## Running locally

```bash
cp .env.example .env   # a working .env with a generated SECRET_KEY is
                        # already included in this checkpoint for convenience —
                        # replace it before any real/shared deployment
docker compose up --build
```

Then:
- Frontend: http://localhost:3000
- API: http://localhost:8000
- API docs (Swagger): http://localhost:8000/api/docs
- Health check: http://localhost:8000/api/v1/healthz

The `backend` service runs `alembic upgrade head` automatically on startup
before starting `uvicorn`.

## Testing

```bash
cd backend
pip install -r requirements-dev.txt
pytest -v --cov=app
```

Run this against SQLite (default, fast, what the fixtures use) for every
commit, and once against a real Postgres instance before any production
deploy:

```bash
DATABASE_URL=postgresql+psycopg://lifeos:lifeos_dev_password@localhost:5432/lifeos pytest -v
```

## Project structure

```
backend/
  app/
    core/        # config, security primitives, deps, middleware, rate limiting
    models/      # SQLAlchemy models (one user_id-scoped table per domain)
    schemas/     # Pydantic request/response models
    services/    # business logic — ownership checks live here, not in routes
    api/v1/      # route handlers — thin, delegate to services
  alembic/       # migrations
  tests/         # pytest suite, including cross-user isolation tests
frontend/
  src/app/       # Next.js App Router pages
  src/lib/       # API client
```

## Security notes

- Passwords: bcrypt via passlib, never logged, never stored plaintext.
- Sessions: random 256-bit token in an HttpOnly/SameSite cookie; only its
  SHA-256 hash is stored server-side, so a database leak alone doesn't hand
  out live sessions. Logout and password reset revoke sessions server-side
  immediately.
- Every user-owned table has a `user_id` column; every query in
  `app/services/*_service.py` filters by it, and single-record lookups
  verify ownership in the same query (see `task_service.get_task_or_raise`
  for the pattern every future domain should follow).
- Rate limiting on login/register/forgot-password is Redis-backed and
  fails open (logs a warning, does not block requests) if Redis is
  unreachable — see the docstring in `app/core/rate_limit.py` for the
  tradeoff reasoning.
- CSRF: not yet fully addressed — see `PROGRESS.md`.
- See `PROGRESS.md` for what's still outstanding before a real launch.

## Environment variables

See `.env.example` for the full list. AI, email, and voice (STT/TTS)
features check `settings.*_configured` and return a clear "not configured"
response rather than pretending to work when their API keys are unset.
