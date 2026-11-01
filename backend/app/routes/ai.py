"""
AI router — itinerary generation, day regeneration, PDF download, and itinerary retrieval.
"""
from __future__ import annotations

import logging
import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, Header, HTTPException, status
from fastapi.responses import StreamingResponse

from app.core.config import settings
from app.schemas.itinerary import (
    GenerateItineraryRequest,
    ItineraryData,
    RegenerateDayRequest,
)
from app.services import ai_service, pdf_service

logger = logging.getLogger(__name__)
router = APIRouter(tags=["ai"])


# ---------------------------------------------------------------------------
# Re-use the same auth helper from trips (avoid circular import by redefining)
# ---------------------------------------------------------------------------

def _extract_user_id_optional(authorization: Optional[str] = Header(default=None)) -> str:
    """Extract user_id from JWT; in demo mode return a static demo id."""
    if not settings.is_supabase_connected or not authorization or not authorization.startswith("Bearer "):
        return "demo-user-00000000-0000-0000-0000-000000000001"

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
        return user_id or "demo-user-00000000-0000-0000-0000-000000000001"
    except Exception:
        return "demo-user-00000000-0000-0000-0000-000000000001"


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


# ---------------------------------------------------------------------------
# Demo itinerary store (mirrors trips router in-memory store)
# ---------------------------------------------------------------------------

# Shared reference — import at call time to avoid circular imports
def _demo_trips() -> dict:
    from app.routes.trips import _demo_trips as dt
    return dt


# ---------------------------------------------------------------------------
# Supabase helper
# ---------------------------------------------------------------------------

def _get_db():
    try:
        from app.database.supabase_client import get_supabase_admin_client
        return get_supabase_admin_client()
    except RuntimeError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc


# ---------------------------------------------------------------------------
# Helper: save itinerary to Supabase or demo store
# ---------------------------------------------------------------------------

def _save_itinerary_to_trip(trip_id: str, itinerary_dict: dict) -> None:
    """Persist the itinerary JSON onto the trip record or itineraries table."""
    trips = _demo_trips()
    if trip_id in trips:
        trips[trip_id]["itinerary"] = itinerary_dict
        trips[trip_id]["updated_at"] = _now_iso()
        return

    if not settings.is_supabase_connected:
        return

    db = _get_db()
    try:
        db.table("itineraries").upsert({
            "trip_id": trip_id,
            "itinerary_data": itinerary_dict,
            "is_demo": settings.is_demo,
        }, on_conflict="trip_id").execute()
    except Exception as exc:
        logger.warning("Could not persist itinerary to trip %s: %s", trip_id, exc)


def _load_itinerary_from_trip(trip_id: str, user_id: str) -> Optional[dict]:
    """Load the itinerary dict from the trip record or itineraries table."""
    trips = _demo_trips()
    if trip_id in trips:
        record = trips.get(trip_id)
        if record and record["user_id"] == user_id:
            return record.get("itinerary")

    if not settings.is_supabase_connected or user_id.startswith("demo-"):
        return None

    db = _get_db()
    try:
        result = db.table("itineraries").select("itinerary_data").eq("trip_id", trip_id).execute()
        if result.data:
            return result.data[0].get("itinerary_data")
        return None
    except Exception as exc:
        logger.error("Could not load itinerary for trip %s: %s", trip_id, exc)
        return None


def _load_trip_record(trip_id: str, user_id: str) -> Optional[dict]:
    """Load the full trip record."""
    trips = _demo_trips()
    if trip_id in trips:
        record = trips.get(trip_id)
        if record and record["user_id"] == user_id:
            return record

    if not settings.is_supabase_connected or user_id.startswith("demo-"):
        return None

    db = _get_db()
    try:
        result = (
            db.table("trips")
            .select("*")
            .eq("id", trip_id)
            .eq("user_id", user_id)
            .execute()
        )
        if result.data:
            trip_rec = result.data[0]
            itin_res = db.table("itineraries").select("itinerary_data").eq("trip_id", trip_id).execute()
            if itin_res.data:
                trip_rec["itinerary"] = itin_res.data[0].get("itinerary_data")
            return trip_rec
        return None
    except Exception as exc:
        logger.error("Could not load trip %s: %s", trip_id, exc)
        return None


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@router.post("/api/ai/generate-itinerary", response_model=ItineraryData)
@router.post("/api/itinerary/generate", response_model=ItineraryData)
async def generate_itinerary(
    body: GenerateItineraryRequest,
    user_id: str = Depends(_extract_user_id_optional),
):
    """
    Generate a full AI-powered itinerary.
    Saves the result to the trip record if trip_id is provided.
    """
    try:
        itinerary = await ai_service.generate_itinerary(body)
    except RuntimeError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(exc),
        ) from exc

    if body.trip_id:
        _save_itinerary_to_trip(body.trip_id, itinerary.model_dump())

    return itinerary


@router.post("/api/ai/regenerate-day", response_model=ItineraryData)
async def regenerate_day(
    body: RegenerateDayRequest,
    user_id: str = Depends(_extract_user_id_optional),
):
    """
    Regenerate a single day in an existing itinerary and return the updated full itinerary.
    """
    # Load the current itinerary to patch
    current = body.current_itinerary
    if not current:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="current_itinerary must be provided.",
        )

    try:
        new_day = await ai_service.regenerate_day(body)
    except RuntimeError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc

    # Patch the specific day in the itinerary
    days = current.get("days", [])
    patched = False
    for i, day in enumerate(days):
        if day.get("day_number") == body.day_number:
            days[i] = new_day.model_dump()
            patched = True
            break

    if not patched:
        # Append if day wasn't found
        days.append(new_day.model_dump())
        days.sort(key=lambda d: d.get("day_number", 0))

    current["days"] = days

    # Persist
    _save_itinerary_to_trip(body.trip_id, current)

    try:
        updated_itinerary = ItineraryData(**current)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to reconstruct itinerary after day regeneration: {exc}",
        ) from exc

    return updated_itinerary


@router.post("/api/ai/regenerate-itinerary", response_model=ItineraryData)
async def regenerate_itinerary(
    body: GenerateItineraryRequest,
    user_id: str = Depends(_extract_user_id_optional),
):
    """
    Fully regenerate an itinerary from scratch (same as generate but always overwrites).
    """
    try:
        itinerary = await ai_service.generate_itinerary(body)
    except RuntimeError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc

    if body.trip_id:
        _save_itinerary_to_trip(body.trip_id, itinerary.model_dump())

    return itinerary


@router.post("/api/itinerary/{trip_id}/regenerate", response_model=ItineraryData)
async def regenerate_itinerary_by_id(
    trip_id: str,
    user_id: str = Depends(_extract_user_id_optional),
):
    """Regenerate itinerary by trip ID directly."""
    trip_record = _load_trip_record(trip_id, user_id) or {}
    req = GenerateItineraryRequest(
        trip_id=trip_id,
        destination=trip_record.get("destination", "Trip Destination"),
        starting_location=trip_record.get("starting_location", "Home City"),
        start_date=trip_record.get("start_date", "2024-06-15"),
        end_date=trip_record.get("end_date", "2024-06-20"),
        travelers=trip_record.get("travelers", 2),
        budget=trip_record.get("budget", 2000.0),
        currency=trip_record.get("currency", "USD"),
        travel_style=trip_record.get("travel_style", "moderate"),
        preferences=trip_record.get("preferences", {}),
    )
    return await regenerate_itinerary(req, user_id)


@router.post("/api/itinerary/{trip_id}/day/{day_number}/regenerate", response_model=ItineraryData)
async def regenerate_day_by_id(
    trip_id: str,
    day_number: int,
    user_id: str = Depends(_extract_user_id_optional),
):
    """Regenerate a single day by trip ID and day number."""
    current = _load_itinerary_from_trip(trip_id, user_id)
    if not current:
        trip_record = _load_trip_record(trip_id, user_id) or {}
        req = GenerateItineraryRequest(
            trip_id=trip_id,
            destination=trip_record.get("destination", "Paris, France"),
            starting_location="Home",
            start_date="2024-06-15",
            end_date="2024-06-20",
            travelers=2,
            budget=2000.0,
            currency="USD",
            travel_style="moderate",
            preferences={},
        )
        fresh_itin = await ai_service.generate_itinerary(req)
        current = fresh_itin.model_dump()
        _save_itinerary_to_trip(trip_id, current)

    regen_req = RegenerateDayRequest(
        trip_id=trip_id,
        day_number=day_number,
        current_itinerary=current,
    )
    return await regenerate_day(regen_req, user_id)


@router.get("/api/trips/{trip_id}/itinerary", response_model=ItineraryData)
@router.get("/api/itinerary/{trip_id}", response_model=ItineraryData)
async def get_itinerary(
    trip_id: str,
    user_id: str = Depends(_extract_user_id_optional),
):
    """Return the saved itinerary for a trip."""
    itinerary_dict = _load_itinerary_from_trip(trip_id, user_id)
    if itinerary_dict is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No itinerary found for this trip. Generate one first.",
        )
    try:
        return ItineraryData(**itinerary_dict)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Stored itinerary data is malformed: {exc}",
        ) from exc


@router.get("/api/trips/{trip_id}/download-pdf")
@router.get("/api/itinerary/{trip_id}/pdf")
async def download_pdf(
    trip_id: str,
    user_id: str = Depends(_extract_user_id_optional),
):
    """Generate and stream a PDF itinerary for the given trip."""
    trip_record = _load_trip_record(trip_id, user_id)
    if trip_record is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found.")

    itinerary_dict = trip_record.get("itinerary")
    if not itinerary_dict:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No itinerary found for this trip. Generate one first.",
        )

    try:
        pdf_bytes = pdf_service.generate_itinerary_pdf(itinerary_dict, trip_record)
    except Exception as exc:
        logger.error("PDF generation failed for trip %s: %s", trip_id, exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"PDF generation failed: {exc}",
        ) from exc

    destination = itinerary_dict.get("destination", "itinerary").replace(" ", "_")
    filename = f"TravelMate_{destination}_{trip_id[:8]}.pdf"

    return StreamingResponse(
        iter([pdf_bytes]),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Content-Length": str(len(pdf_bytes)),
        },
    )
