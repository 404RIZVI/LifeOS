FROM python:3.12-slim AS base

# Prevent Python from writing .pyc files / buffering stdout (clean logs)
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# System deps needed to build psycopg[binary] wheels on some platforms and
# for healthcheck curl calls.
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Create an unprivileged user -- never run the app as root in production.
RUN useradd --create-home --shell /bin/bash appuser

COPY . .
RUN chown -R appuser:appuser /app

USER appuser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/api/v1/healthz || exit 1

# In production, run behind a reverse proxy (nginx/Caddy) terminating TLS.
# --workers should scale with CPU cores; 4 is a reasonable default for a
# small instance and should be tuned per deployment.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
