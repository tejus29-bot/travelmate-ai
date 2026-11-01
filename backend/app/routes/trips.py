"""
Trips router — full CRUD for trip records stored in Supabase.
Auth: JWT extracted from Authorization: Bearer <token> header.
"""
from __future__ import annotations

import logging
import secrets
import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, Header, HTTPException, status

from app.core.config import settings
from app.schemas.trip import TripCreate, TripResponse, TripUpdate

logger = logging.getLogger(__name__)
router = APIRouter(tags=["trips"])


# ---------------------------------------------------------------------------
# Auth helpers
# ---------------------------------------------------------------------------

def _extract_user_id(authorization: Optional[str] = Header(default=None)) -> str:
    """
    Decode the JWT from the Authorization header and return the user_id (sub claim).
    In DEMO_MODE or without auth, return a demo user id.
    """
    if not settings.is_supabase_connected:
        return "demo-user-00000000-0000-0000-0000-000000000001"

    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or malformed Authorization header.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = authorization.split(" ", 1)[1]
    if token == "demo-token":
        return "demo-user-00000000-0000-0000-0000-000000000001"

    try:
        from jose import jwt
        payload = jwt.decode(
            token,
            "",
            options={"verify_signature": False, "verify_aud": False},
        )
        user_id: str = payload.get("sub") or payload.get("user_id") or ""
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token does not contain a user id.",
            )
        return user_id
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {exc}",
        ) from exc


# ---------------------------------------------------------------------------
# Demo in-memory store (used when DEMO_MODE=True)
# ---------------------------------------------------------------------------

_demo_trips: dict[str, dict] = {}


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _trip_to_response(record: dict) -> dict:
    return {
        "id": record["id"],
        "user_id": record["user_id"],
        "destination": record["destination"],
        "starting_location": record["starting_location"],
        "start_date": record["start_date"],
        "end_date": record["end_date"],
        "travelers": record["travelers"],
        "budget": record["budget"],
        "currency": record["currency"],
        "travel_style": record["travel_style"],
        "preferences": record.get("preferences", {}),
        "itinerary": record.get("itinerary"),
        "share_token": record.get("share_token"),
        "created_at": record["created_at"],
        "updated_at": record["updated_at"],
    }


# ---------------------------------------------------------------------------
# Supabase helpers
# ---------------------------------------------------------------------------

def _get_db():
    """Return admin Supabase client or raise a clear error."""
    try:
        from app.database.supabase_client import get_supabase_admin_client
        return get_supabase_admin_client()
    except RuntimeError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@router.post("/api/trips", status_code=status.HTTP_201_CREATED)
async def create_trip(
    body: TripCreate,
    user_id: str = Depends(_extract_user_id),
):
    """Create a new trip for the authenticated user."""
    trip_id = str(uuid.uuid4())
    now = _now_iso()
    record = {
        "id": trip_id,
        "user_id": user_id,
        "destination": body.destination,
        "starting_location": body.starting_location,
        "start_date": body.start_date,
        "end_date": body.end_date,
        "travelers": body.travelers,
        "budget": body.budget,
        "currency": body.currency,
        "travel_style": body.travel_style,
        "preferences": body.preferences.model_dump(),
        "created_at": now,
        "updated_at": now,
    }

    if not settings.is_supabase_connected or user_id.startswith("demo-"):
        _demo_trips[trip_id] = {**record, "itinerary": None, "share_token": None}
        return _trip_to_response(_demo_trips[trip_id])

    db = _get_db()
    try:
        result = db.table("trips").insert(record).execute()
        if not result.data:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create trip.")
        return _trip_to_response(result.data[0])
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Error creating trip: %s", exc)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc)) from exc


@router.get("/api/trips")
async def list_trips(user_id: str = Depends(_extract_user_id)):
    """Return all trips belonging to the authenticated user."""
    if not settings.is_supabase_connected or user_id.startswith("demo-"):
        user_trips = [t for t in _demo_trips.values() if t["user_id"] == user_id]
        return {"trips": [_trip_to_response(t) for t in user_trips], "total": len(user_trips)}

    db = _get_db()
    try:
        result = db.table("trips").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        trips = result.data or []
        return {"trips": [_trip_to_response(t) for t in trips], "total": len(trips)}
    except Exception as exc:
        logger.error("Error listing trips: %s", exc)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc)) from exc


@router.get("/api/trips/{trip_id}")
async def get_trip(trip_id: str, user_id: str = Depends(_extract_user_id)):
    """Return a single trip by ID (must belong to the authenticated user)."""
    if not settings.is_supabase_connected or user_id.startswith("demo-"):
        record = _demo_trips.get(trip_id)
        if not record or record["user_id"] != user_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found.")
        return _trip_to_response(record)

    db = _get_db()
    try:
        result = db.table("trips").select("*").eq("id", trip_id).eq("user_id", user_id).execute()
        if not result.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found.")
        return _trip_to_response(result.data[0])
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Error getting trip %s: %s", trip_id, exc)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc)) from exc


@router.put("/api/trips/{trip_id}")
async def update_trip(
    trip_id: str,
    body: TripUpdate,
    user_id: str = Depends(_extract_user_id),
):
    """Update an existing trip (partial update — only supplied fields are changed)."""
    updates: dict = {k: v for k, v in body.model_dump(exclude_none=True).items()}
    if "preferences" in updates and isinstance(updates["preferences"], dict):
        # Already dumped by model_dump
        pass
    updates["updated_at"] = _now_iso()

    if not settings.is_supabase_connected or user_id.startswith("demo-"):
        record = _demo_trips.get(trip_id)
        if not record or record["user_id"] != user_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found.")
        record.update(updates)
        return _trip_to_response(record)

    db = _get_db()
    try:
        # Don't update itinerary column in trips table
        db_updates = {k: v for k, v in updates.items() if k != "itinerary"}
        result = db.table("trips").update(db_updates).eq("id", trip_id).eq("user_id", user_id).execute()
        if not result.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found.")
        return _trip_to_response(result.data[0])
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Error updating trip %s: %s", trip_id, exc)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc)) from exc


@router.delete("/api/trips/{trip_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_trip(trip_id: str, user_id: str = Depends(_extract_user_id)):
    """Delete a trip and its associated itinerary."""
    if not settings.is_supabase_connected or user_id.startswith("demo-"):
        record = _demo_trips.pop(trip_id, None)
        if not record or record["user_id"] != user_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found.")
        return

    db = _get_db()
    try:
        # Delete itineraries first (FK constraint)
        db.table("itineraries").delete().eq("trip_id", trip_id).execute()
        result = db.table("trips").delete().eq("id", trip_id).eq("user_id", user_id).execute()
        if not result.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found.")
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Error deleting trip %s: %s", trip_id, exc)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc)) from exc


# ---------------------------------------------------------------------------
# Sharing
# ---------------------------------------------------------------------------

@router.get("/api/trips/{trip_id}/share")
async def generate_share_token(trip_id: str, user_id: str = Depends(_extract_user_id)):
    """Generate (or return existing) shareable token for a trip's itinerary."""
    token = secrets.token_urlsafe(24)
    updates = {"share_token": token, "updated_at": _now_iso()}

    if not settings.is_supabase_connected or user_id.startswith("demo-"):
        record = _demo_trips.get(trip_id)
        if not record or record["user_id"] != user_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found.")
        # Reuse existing token if already generated
        if record.get("share_token"):
            return {"share_token": record["share_token"], "trip_id": trip_id}
        record.update(updates)
        return {"share_token": token, "trip_id": trip_id}

    db = _get_db()
    try:
        # Check existing token
        existing = db.table("trips").select("share_token").eq("id", trip_id).eq("user_id", user_id).execute()
        if not existing.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found.")
        existing_token = existing.data[0].get("share_token")
        if existing_token:
            return {"share_token": existing_token, "trip_id": trip_id}
        result = db.table("trips").update(updates).eq("id", trip_id).eq("user_id", user_id).execute()
        return {"share_token": result.data[0]["share_token"], "trip_id": trip_id}
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Error generating share token: %s", exc)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc)) from exc


@router.get("/api/shared/{share_token}")
async def get_shared_itinerary(share_token: str):
    """
    Public endpoint — return a shared itinerary by its token.
    No authentication required.
    """
    if not settings.is_supabase_connected:
        for record in _demo_trips.values():
            if record.get("share_token") == share_token:
                return {
                    "trip": _trip_to_response(record),
                    "itinerary": record.get("itinerary"),
                }
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shared itinerary not found.")

    db = _get_db()
    try:
        result = db.table("trips").select("*").eq("share_token", share_token).execute()
        if not result.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shared itinerary not found.")
        record = result.data[0]
        return {
            "trip": _trip_to_response(record),
            "itinerary": record.get("itinerary"),
        }
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Error fetching shared itinerary: %s", exc)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc)) from exc
