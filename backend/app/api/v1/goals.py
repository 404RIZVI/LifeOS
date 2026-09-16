import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.goal import GoalCreate, GoalListResponse, GoalOut, GoalUpdate
from app.services import goal_service


router = APIRouter(prefix="/goals", tags=["goals"])


@router.get("", response_model=GoalListResponse)
def list_goals(
    status_filter: str | None = Query(default=None, alias="status"),
    search: str | None = None,
    category: str | None = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=25, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db=Depends(get_db),
):
    goals, total = goal_service.list_goals(
        db=db,
        user_id=current_user.id,
        status=status_filter,
        search=search,
        category=category,
        page=page,
        page_size=page_size,
    )

    return GoalListResponse(
        items=[GoalOut.model_validate(goal) for goal in goals],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=goal_service.total_pages(total, page_size),
    )


@router.post("", response_model=GoalOut, status_code=status.HTTP_201_CREATED)
def create_goal(
    payload: GoalCreate,
    current_user: User = Depends(get_current_user),
    db=Depends(get_db),
):
    goal = goal_service.create_goal(
        db=db,
        user_id=current_user.id,
        payload=payload,
    )

    return GoalOut.model_validate(goal)


@router.get("/{goal_id}", response_model=GoalOut)
def get_goal(
    goal_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db=Depends(get_db),
):
    try:
        goal = goal_service.get_goal_or_raise(
            db=db,
            user_id=current_user.id,
            goal_id=goal_id,
        )
    except goal_service.GoalNotFound:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found",
        )

    return GoalOut.model_validate(goal)


@router.put("/{goal_id}", response_model=GoalOut)
def update_goal(
    goal_id: uuid.UUID,
    payload: GoalUpdate,
    current_user: User = Depends(get_current_user),
    db=Depends(get_db),
):
    try:
        goal = goal_service.update_goal(
            db=db,
            user_id=current_user.id,
            goal_id=goal_id,
            payload=payload,
        )
    except goal_service.GoalNotFound:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found",
        )

    return GoalOut.model_validate(goal)


@router.post("/{goal_id}/complete", response_model=GoalOut)
def complete_goal(
    goal_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db=Depends(get_db),
):
    try:
        goal = goal_service.complete_goal(
            db=db,
            user_id=current_user.id,
            goal_id=goal_id,
        )
    except goal_service.GoalNotFound:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found",
        )

    return GoalOut.model_validate(goal)


@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_goal(
    goal_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db=Depends(get_db),
):
    try:
        goal_service.delete_goal(
            db=db,
            user_id=current_user.id,
            goal_id=goal_id,
        )
    except goal_service.GoalNotFound:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found",
        )

    return None
