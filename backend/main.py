"""
TravelMate AI — FastAPI application entry point.
"""
from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from datetime import datetime, timezone

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.routes import ai, auth, destinations, health, trips

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("travelmate")


# ---------------------------------------------------------------------------
# Lifespan
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    # ── Startup ──────────────────────────────────────────────────────────────
    logger.info("=" * 60)
    logger.info("  TravelMate AI Backend  —  starting up")
    logger.info("  Demo mode   : %s", settings.is_demo)
    logger.info("  Frontend URL: %s", settings.FRONTEND_URL)
    logger.info("  Supabase URL: %s", settings.SUPABASE_URL or "(not configured)")
    logger.info(
        "  OpenAI key  : %s",
        "configured"
        if settings.OPENAI_API_KEY and settings.OPENAI_API_KEY != "your_openai_api_key_here"
        else "NOT configured (demo mode active)",
    )
    logger.info("=" * 60)
    yield
    # ── Shutdown ─────────────────────────────────────────────────────────────
    logger.info("TravelMate AI Backend shutting down.")


# ---------------------------------------------------------------------------
# App factory
# ---------------------------------------------------------------------------

app = FastAPI(
    title="TravelMate AI API",
    description=(
        "AI-powered travel itinerary generator. "
        "Create personalised day-by-day travel plans, manage trips, "
        "download PDF itineraries, and share plans with travel companions."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------

origins = [settings.FRONTEND_URL]
# Also allow common local dev ports
for port in (3000, 5173, 5174, 8080):
    origins.append(f"http://localhost:{port}")
    origins.append(f"http://127.0.0.1:{port}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.onrender\.com|https://.*\.vercel\.app|http://localhost:.*|http://127\.0\.0\.1:.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Exception handlers
# ---------------------------------------------------------------------------


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Return a clean 422 with structured error details."""
    errors = []
    for error in exc.errors():
        errors.append(
            {
                "field": " -> ".join(str(loc) for loc in error["loc"]),
                "message": error["msg"],
                "type": error["type"],
            }
        )
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": "Validation error",
            "errors": errors,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        },
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    """Catch-all for unhandled exceptions — log and return 500."""
    logger.exception(
        "Unhandled exception on %s %s: %s", request.method, request.url.path, exc
    )
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "An unexpected internal server error occurred.",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        },
    )


# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------

app.include_router(health.router)
app.include_router(auth.router)
app.include_router(trips.router)
app.include_router(ai.router)
app.include_router(destinations.router)


# ---------------------------------------------------------------------------
# Frontend Static Files & SPA Fallback
# ---------------------------------------------------------------------------
import os
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

_dist_candidates = [
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist")),
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")),
    os.path.abspath(os.path.join(os.path.dirname(__file__), "dist")),
    os.path.abspath(os.path.join(os.getcwd(), "frontend", "dist")),
    os.path.abspath(os.path.join(os.getcwd(), "dist")),
]

FRONTEND_DIST = None
for candidate in _dist_candidates:
    if os.path.exists(os.path.join(candidate, "index.html")):
        FRONTEND_DIST = candidate
        break

if FRONTEND_DIST:
    logger.info("Serving frontend SPA from: %s", FRONTEND_DIST)
    assets_path = os.path.join(FRONTEND_DIST, "assets")
    if os.path.exists(assets_path):
        app.mount("/assets", StaticFiles(directory=assets_path), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str):
        if (
            full_path.startswith("api/")
            or full_path.startswith("docs")
            or full_path.startswith("redoc")
            or full_path.startswith("openapi")
        ):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not Found")

        file_path = os.path.join(FRONTEND_DIST, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(FRONTEND_DIST, "index.html"))
else:
    @app.get("/", include_in_schema=False)
    async def root():
        return {
            "service": "TravelMate AI API",
            "version": "1.0.0",
            "docs": "/docs",
            "health": "/api/health",
            "demo_mode": settings.is_demo,
        }
