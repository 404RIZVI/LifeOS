from fastapi import APIRouter, HTTPException, status

from app.schemas.contact import ContactMessageCreate
from app.services.email import send_contact_email

router = APIRouter(prefix="/contact", tags=["Contact"])


@router.post("", status_code=status.HTTP_200_OK)
def submit_contact_message(data: ContactMessageCreate):
    try:
        send_contact_email(
            name=data.name,
            email=str(data.email),
            message=data.message,
        )

        return {
            "success": True,
            "message": "Your message has been sent successfully.",
        }

    except RuntimeError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Contact email service is temporarily unavailable.",
        )