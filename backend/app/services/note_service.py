import uuid

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.models.note import Note
from app.schemas.note import NoteCreate, NoteUpdate


class NoteNotFound(Exception):
    pass


def _tags_to_str(tags: list[str] | None) -> str | None:
    if not tags:
        return None

    cleaned = [
        tag.strip()
        for tag in tags
        if tag.strip()
    ]

    return ",".join(cleaned) if cleaned else None


def _tags_to_list(tags: str | None) -> list[str]:
    if not tags:
        return []

    return [
        tag.strip()
        for tag in tags.split(",")
        if tag.strip()
    ]


def create_note(
    db: Session,
    user_id: uuid.UUID,
    payload: NoteCreate,
) -> Note:
    note = Note(
        user_id=user_id,
        title=payload.title,
        content=payload.content,
        category=payload.category,
        tags=_tags_to_str(payload.tags),
    )

    db.add(note)
    db.commit()
    db.refresh(note)

    return note


def get_note(
    db: Session,
    user_id: uuid.UUID,
    note_id: uuid.UUID,
) -> Note:
    stmt = select(Note).where(
        Note.id == note_id,
        Note.user_id == user_id,
    )

    note = db.scalar(stmt)

    if note is None:
        raise NoteNotFound()

    return note


def list_notes(
    db: Session,
    user_id: uuid.UUID,
    search: str | None = None,
    category: str | None = None,
    page: int = 1,
    page_size: int = 50,
):
    conditions = [
        Note.user_id == user_id,
    ]

    if search:
        search_term = f"%{search}%"

        conditions.append(
            or_(
                Note.title.ilike(search_term),
                Note.content.ilike(search_term),
            )
        )

    if category:
        conditions.append(
            Note.category == category
        )

    count_stmt = (
        select(func.count())
        .select_from(Note)
        .where(*conditions)
    )

    total = db.scalar(count_stmt) or 0

    stmt = (
        select(Note)
        .where(*conditions)
        .order_by(Note.updated_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )

    notes = list(db.scalars(stmt).all())

    total_pages = (
        (total + page_size - 1) // page_size
        if total > 0
        else 0
    )

    return notes, total, total_pages


def update_note(
    db: Session,
    user_id: uuid.UUID,
    note_id: uuid.UUID,
    payload: NoteUpdate,
) -> Note:
    note = get_note(
        db=db,
        user_id=user_id,
        note_id=note_id,
    )

    update_data = payload.model_dump(
        exclude_unset=True
    )

    if "tags" in update_data:
        update_data["tags"] = _tags_to_str(
            update_data["tags"]
        )

    for field, value in update_data.items():
        setattr(note, field, value)

    db.commit()
    db.refresh(note)

    return note


def delete_note(
    db: Session,
    user_id: uuid.UUID,
    note_id: uuid.UUID,
) -> None:
    note = get_note(
        db=db,
        user_id=user_id,
        note_id=note_id,
    )

    db.delete(note)
    db.commit()