"""Unified API response helpers."""

from typing import Any
from uuid import uuid4

from fastapi.responses import JSONResponse

from common.errors import AppError


def create_request_id() -> str:
    return f"req_{uuid4().hex[:16]}"


def success_response(
    data: Any,
    message: str = "ok",
    request_id: str | None = None,
) -> dict[str, Any]:
    return {
        "success": True,
        "data": data,
        "message": message,
        "requestId": request_id or create_request_id(),
    }


def error_response(error: AppError, request_id: str | None = None) -> JSONResponse:
    return JSONResponse(
        status_code=error.status_code,
        content={
            "success": False,
            "error": {
                "code": error.code,
                "message": error.message,
                "details": error.details,
            },
            "requestId": request_id or create_request_id(),
        },
    )
