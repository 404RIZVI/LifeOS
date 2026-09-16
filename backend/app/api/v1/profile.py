from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.profile import ProfileOut, ProfileUpdateRequest

router = APIRouter(prefix="/profile", tags=["profile"])


@router.get("/", response_model=ProfileOut)
def get_profile(current_user: User = Depends(get_current_user)):
    profile = current_user.profile
    return ProfileOut(
        user_id=current_user.id,
        email=current_user.email,
        full_name=profile.full_name,
        avatar_url=profile.avatar_url,
        timezone=profile.timezone,
        language=profile.language,
        is_verified=current_user.is_verified,
        created_at=current_user.created_at,
    )


@router.put("/", response_model=ProfileOut)
def update_profile(
    payload: ProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = current_user.profile
    if payload.full_name is not None:
        profile.full_name = payload.full_name
    if payload.timezone is not None:
        profile.timezone = payload.timezone
    if payload.language is not None:
        profile.language = payload.language
    db.commit()
    db.refresh(profile)

    return ProfileOut(
        user_id=current_user.id,
        email=current_user.email,
        full_name=profile.full_name,
        avatar_url=profile.avatar_url,
        timezone=profile.timezone,
        language=profile.language,
        is_verified=current_user.is_verified,
        created_at=current_user.created_at,
    )
