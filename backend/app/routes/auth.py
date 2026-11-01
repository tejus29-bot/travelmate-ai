"""
Auth router – handles user registration via Supabase admin to bypass public email rate limits.
"""
from __future__ import annotations

import logging
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr

from app.core.config import settings
from app.database.supabase_client import get_supabase_admin_client

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/auth", tags=["auth"])


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str = ""


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(body: RegisterRequest):
    """
    Register a new user directly in Supabase using the admin service key.
    Pre-confirms the email so no activation email is sent, completely avoiding
    Supabase's built-in email rate limits on free projects.
    """
    if not settings.is_supabase_connected:
        return {
            "status": "ok",
            "message": "Demo mode user registered",
            "user": {
                "id": "demo-user-001",
                "email": body.email,
                "user_metadata": {"full_name": body.full_name},
            },
        }

    admin = get_supabase_admin_client()
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Supabase admin service unavailable.",
        )

    try:
        res = admin.auth.admin.create_user({
            "email": body.email,
            "password": body.password,
            "email_confirm": True,
            "user_metadata": {"full_name": body.full_name},
        })
        user_data = res.user if hasattr(res, "user") else res
        user_id = getattr(user_data, "id", None) or (
            user_data.get("id") if isinstance(user_data, dict) else ""
        )

        return {
            "status": "ok",
            "message": "User registered successfully.",
            "user_id": user_id,
        }
    except Exception as exc:
        msg = str(exc)
        logger.error("Failed to register user %s: %s", body.email, msg)
        if "already registered" in msg.lower() or "already been registered" in msg.lower():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A user with this email address already exists. Please sign in instead.",
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=msg,
        ) from exc
