from __future__ import annotations

from typing import Optional, List
from pydantic import BaseModel, Field


class TripPreferences(BaseModel):
    interests: List[str] = Field(default_factory=list)
    accommodation_type: str = Field(default="hotel")
    transportation: str = Field(default="mixed")
    dietary: List[str] = Field(default_factory=list)
    activity_intensity: str = Field(
        default="balanced",
        description="relaxed | balanced | packed",
    )
    additional_instructions: str = Field(default="")


class TripCreate(BaseModel):
    destination: str
    starting_location: str
    start_date: str  # ISO date string e.g. "2024-08-01"
    end_date: str    # ISO date string e.g. "2024-08-07"
    travelers: int = Field(default=1, ge=1)
    budget: float = Field(gt=0)
    currency: str = Field(default="USD")
    travel_style: str = Field(
        default="moderate",
        description="budget | moderate | luxury",
    )
    preferences: TripPreferences = Field(default_factory=TripPreferences)


class TripUpdate(BaseModel):
    destination: Optional[str] = None
    starting_location: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    travelers: Optional[int] = Field(default=None, ge=1)
    budget: Optional[float] = Field(default=None, gt=0)
    currency: Optional[str] = None
    travel_style: Optional[str] = None
    preferences: Optional[TripPreferences] = None


class TripResponse(BaseModel):
    id: str
    user_id: str
    destination: str
    starting_location: str
    start_date: str
    end_date: str
    travelers: int
    budget: float
    currency: str
    travel_style: str
    preferences: dict
    itinerary: Optional[dict] = None
    share_token: Optional[str] = None
    created_at: str
    updated_at: str
