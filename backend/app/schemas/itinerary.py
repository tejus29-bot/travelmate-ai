from __future__ import annotations

from typing import Optional, List
from pydantic import BaseModel, Field


class Activity(BaseModel):
    name: str
    description: str
    location: str
    start_time: str
    end_time: str
    estimated_cost: float
    category: str
    travel_time_from_previous: str
    booking_required: bool


class DayPlan(BaseModel):
    day_number: int
    date: str
    theme: str
    activities: List[Activity]


class BudgetBreakdown(BaseModel):
    accommodation: float
    food: float
    transportation: float
    activities: float
    miscellaneous: float


class ItineraryData(BaseModel):
    trip_title: str
    destination: str
    summary: str
    total_estimated_budget: float
    currency: str
    budget_breakdown: BudgetBreakdown
    days: List[DayPlan]
    travel_tips: List[str]


class GenerateItineraryRequest(BaseModel):
    trip_id: Optional[str] = None
    destination: str
    starting_location: str
    start_date: str
    end_date: str
    travelers: int = Field(default=1, ge=1)
    budget: float = Field(gt=0)
    currency: str = Field(default="USD")
    travel_style: str = Field(default="moderate")
    preferences: dict = Field(default_factory=dict)


class RegenerateDayRequest(BaseModel):
    trip_id: str
    day_number: int
    current_itinerary: dict
    special_instructions: str = ""
