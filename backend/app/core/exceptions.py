import logging
import uuid

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

logger = logging.getLogger("lifeos.errors")


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": {
                    "message": str(exc.detail),
                    "status_code": exc.status_code,
                }
            },
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        request: Request,
        exc: RequestValidationError,
    ):
        safe_errors = []

        for error in exc.errors():
            safe_error = dict(error)

            if "ctx" in safe_error:
                safe_error["ctx"] = {
                    key: str(value)
                    for key, value in safe_error["ctx"].items()
                }

            safe_errors.append(safe_error)

        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "error": {
                    "message": "Validation failed.",
                    "status_code": 422,
                    "fields": safe_errors,
                }
            },
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception):
        error_id = str(uuid.uuid4())

        logger.exception(
            "Unhandled exception [error_id=%s] on %s %s",
            error_id,
            request.method,
            request.url.path,
        )

        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": {
                    "message": "Something went wrong on our end. Please try again.",
                    "status_code": 500,
                    "error_id": error_id,
                }
            },
        )