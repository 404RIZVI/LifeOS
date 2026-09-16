from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.db.session import get_db

router = APIRouter(tags=["health"])


@router.get("/healthz")
def liveness():
    """Is the process up at all? Does not touch the DB."""
    return {"status": "ok"}


@router.get("/readyz")
def readiness(db: Session = Depends(get_db)):
    """Is the process ready to serve traffic (DB reachable)?"""
    db.execute(text("SELECT 1"))
    return {"status": "ok", "database": "reachable"}
