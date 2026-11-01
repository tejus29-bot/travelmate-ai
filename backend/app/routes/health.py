from datetime import datetime, timezone

from fastapi import APIRouter

from app.core.config import settings

router = APIRouter(tags=["health"])


@router.get("/api/health")
async def health_check():
    """Health-check endpoint — confirms the server is running and surfaces demo mode status."""
    return {
        "status": "ok",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "demo_mode": settings.is_demo,
        "version": "1.0.0",
    }
