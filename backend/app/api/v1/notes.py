import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.note import NoteCreate, NoteListResponse, NoteOut, NoteUpdate
from app.services import note_service


router = APIRouter(
    prefix="/notes",
    tags=["notes"],
)


def to_note_out(note):
    return NoteOut(
        id=note.id,
        title=note.title,
        content=note.content,
        category=note.category,
        tags=note_service._tags_to_list(note.tags),
        created_at=note.created_at,
        updated_at=note.updated_at,
    )


@router.get("", response_model=NoteListResponse)
def list_notes(
    search: str | None = Query(default=None),
    category: str | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=50, ge=1, le=500),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    notes, total, total_pages = note_service.list_notes(
        db=db,
        user_id=current_user.id,
        search=search,
        category=category,
        page=page,
        page_size=page_size,
    )

    return NoteListResponse(
        items=[to_note_out(note) for note in notes],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.post(
    "",
    response_model=NoteOut,
    status_code=status.HTTP_201_CREATED,
)
def create_note(
    payload: NoteCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    note = note_service.create_note(
        db=db,
        user_id=current_user.id,
        payload=payload,
    )

    return to_note_out(note)


@router.get("/{note_id}", response_model=NoteOut)
def get_note(
    note_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        note = note_service.get_note(
            db=db,
            user_id=current_user.id,
            note_id=note_id,
        )
    except note_service.NoteNotFound:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found",
        )

    return to_note_out(note)


@router.put("/{note_id}", response_model=NoteOut)
def update_note(
    note_id: uuid.UUID,
    payload: NoteUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        note = note_service.update_note(
            db=db,
            user_id=current_user.id,
            note_id=note_id,
            payload=payload,
        )
    except note_service.NoteNotFound:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found",
        )

    return to_note_out(note)


@router.delete(
    "/{note_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_note(
    note_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        note_service.delete_note(
            db=db,
            user_id=current_user.id,
            note_id=note_id,
        )
    except note_service.NoteNotFound:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found",
        )

    return None
