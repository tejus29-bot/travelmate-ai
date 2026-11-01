"""
AI Service — generates travel itineraries via OpenAI GPT-4o-mini.
Falls back to a realistic demo itinerary when DEMO_MODE is true or no API key is set.
"""
from __future__ import annotations

import json
import logging
from datetime import date, timedelta, datetime

from app.core.config import settings
from app.schemas.itinerary import (
    Activity,
    BudgetBreakdown,
    DayPlan,
    GenerateItineraryRequest,
    ItineraryData,
    RegenerateDayRequest,
)

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Helper utilities
# ---------------------------------------------------------------------------

def _date_range(start: str, end: str) -> list[date]:
    """Return every date between start and end inclusive."""
    s = date.fromisoformat(start)
    e = date.fromisoformat(end)
    days: list[date] = []
    current = s
    while current <= e:
        days.append(current)
        current += timedelta(days=1)
    return days


def _build_system_prompt() -> str:
    return (
        "You are an expert travel planner with decades of experience crafting "
        "personalised, realistic itineraries. "
        "Consider opening hours, geographic clustering of attractions, meal times, "
        "local transport logistics, and travel time between locations. "
        "Return ONLY valid JSON — no markdown fences, no extra keys — matching "
        "exactly the schema described in the user message."
    )


def _build_user_prompt(req: GenerateItineraryRequest) -> str:
    days = _date_range(req.start_date, req.end_date)
    num_days = len(days)
    prefs_str = json.dumps(req.preferences, indent=2)

    schema = """{
  "trip_title": "string",
  "destination": "string",
  "summary": "string",
  "total_estimated_budget": number,
  "currency": "string",
  "budget_breakdown": {
    "accommodation": number,
    "food": number,
    "transportation": number,
    "activities": number,
    "miscellaneous": number
  },
  "days": [
    {
      "day_number": integer,
      "date": "YYYY-MM-DD",
      "theme": "string",
      "activities": [
        {
          "name": "string",
          "description": "string (2-3 sentences)",
          "location": "string",
          "start_time": "HH:MM",
          "end_time": "HH:MM",
          "estimated_cost": number,
          "category": "string (e.g. sightseeing, food, transport, entertainment)",
          "travel_time_from_previous": "string (e.g. '10 min walk')",
          "booking_required": boolean
        }
      ]
    }
  ],
  "travel_tips": ["string", ...]
}"""

    return (
        f"Create a {num_days}-day travel itinerary for the following trip:\n\n"
        f"Destination: {req.destination}\n"
        f"Departing from: {req.starting_location}\n"
        f"Dates: {req.start_date} to {req.end_date} ({num_days} days)\n"
        f"Travelers: {req.travelers}\n"
        f"Total budget: {req.budget} {req.currency}\n"
        f"Travel style: {req.travel_style} (budget | moderate | luxury)\n"
        f"Preferences:\n{prefs_str}\n\n"
        f"Rules:\n"
        f"- Include at least 4 activities per day (breakfast, sightseeing, lunch, afternoon activity, dinner).\n"
        f"- Cluster activities geographically to minimise travel time.\n"
        f"- Ensure the sum of budget_breakdown equals total_estimated_budget.\n"
        f"- total_estimated_budget must not exceed {req.budget} {req.currency}.\n"
        f"- All dates must fall between {req.start_date} and {req.end_date}.\n"
        f"- travel_tips must contain at least 5 useful, specific tips for {req.destination}.\n\n"
        f"Return ONLY JSON matching this schema:\n{schema}"
    )


def _build_day_regen_prompt(req: RegenerateDayRequest) -> str:
    day_data = None
    for d in req.current_itinerary.get("days", []):
        if d.get("day_number") == req.day_number:
            day_data = d
            break

    date_str = day_data["date"] if day_data else "unknown date"
    destination = req.current_itinerary.get("destination", "the destination")
    currency = req.current_itinerary.get("currency", "USD")

    schema = """{
  "day_number": integer,
  "date": "YYYY-MM-DD",
  "theme": "string",
  "activities": [
    {
      "name": "string",
      "description": "string",
      "location": "string",
      "start_time": "HH:MM",
      "end_time": "HH:MM",
      "estimated_cost": number,
      "category": "string",
      "travel_time_from_previous": "string",
      "booking_required": boolean
    }
  ]
}"""

    instructions = ""
    if req.special_instructions:
        instructions = f"\nSpecial instructions from the traveler: {req.special_instructions}\n"

    return (
        f"Regenerate Day {req.day_number} ({date_str}) of the trip to {destination}.\n"
        f"{instructions}"
        f"Keep the same date ({date_str}) and day_number ({req.day_number}).\n"
        f"The new day should be completely different from the original activities but "
        f"equally detailed and realistic.\n"
        f"Currency for costs: {currency}.\n"
        f"Include at least 4-5 activities.\n"
        f"Return ONLY JSON matching this schema:\n{schema}"
    )


# ---------------------------------------------------------------------------
# Demo data factory
# ---------------------------------------------------------------------------

def _build_demo_itinerary(req: GenerateItineraryRequest) -> ItineraryData:
    """
    Build a realistic-looking sample itinerary adapted to the requested
    destination, dates, budget, and traveler count.
    """
    days_list = _date_range(req.start_date, req.end_date)
    num_days = len(days_list)
    dest = req.destination
    currency = req.currency
    budget = req.budget
    travelers = req.travelers

    # Budget split percentages vary by style
    splits = {
        "budget":   dict(accommodation=0.30, food=0.25, transportation=0.20, activities=0.15, miscellaneous=0.10),
        "moderate": dict(accommodation=0.35, food=0.25, transportation=0.15, activities=0.20, miscellaneous=0.05),
        "luxury":   dict(accommodation=0.40, food=0.25, transportation=0.15, activities=0.15, miscellaneous=0.05),
    }
    split = splits.get(req.travel_style, splits["moderate"])
    breakdown = BudgetBreakdown(
        accommodation=round(budget * split["accommodation"], 2),
        food=round(budget * split["food"], 2),
        transportation=round(budget * split["transportation"], 2),
        activities=round(budget * split["activities"], 2),
        miscellaneous=round(budget * split["miscellaneous"], 2),
    )

    # Per-day activity templates (we cycle through themes)
    day_themes = [
        "Arrival & City Highlights",
        "Cultural Immersion & Local Markets",
        "Nature & Outdoor Adventures",
        "Museums, Art & History",
        "Local Cuisine & Neighbourhood Exploration",
        "Day Trip & Scenic Views",
        "Leisure, Shopping & Farewell",
    ]

    # Generic activity sets per theme position (adapted with dest name)
    def make_activities(theme_idx: int, day_date: date, daily_budget: float) -> list[Activity]:
        act_budget = daily_budget * 0.25  # activities slice per day
        templates = [
            [
                Activity(name=f"Arrival at {dest} & Hotel Check-in", description=f"Touch down in {dest} and transfer to your accommodation. Take a moment to freshen up before exploring.", location=f"{dest} International Airport", start_time="10:00", end_time="12:00", estimated_cost=round(daily_budget * 0.05, 2), category="transport", travel_time_from_previous="N/A", booking_required=False),
                Activity(name="Welcome Lunch at Local Restaurant", description=f"Savour your first taste of {dest}'s cuisine at a well-rated local restaurant near the city centre.", location=f"City Centre, {dest}", start_time="12:30", end_time="14:00", estimated_cost=round(daily_budget * 0.10, 2), category="food", travel_time_from_previous="15 min taxi", booking_required=False),
                Activity(name=f"{dest} Old Town Walking Tour", description=f"Join a guided walking tour of {dest}'s historic old town, taking in iconic landmarks and architecture.", location=f"Old Town, {dest}", start_time="14:30", end_time="17:00", estimated_cost=round(daily_budget * 0.08, 2), category="sightseeing", travel_time_from_previous="10 min walk", booking_required=True),
                Activity(name="Sunset at Central Viewpoint", description=f"Enjoy panoramic views of {dest} from the city's most popular viewpoint as the sun sets.", location=f"Viewpoint Hill, {dest}", start_time="18:00", end_time="19:00", estimated_cost=0.0, category="sightseeing", travel_time_from_previous="20 min walk", booking_required=False),
                Activity(name="Welcome Dinner", description=f"Relax over a delicious dinner at a restaurant showcasing {dest}'s signature dishes.", location=f"Restaurant District, {dest}", start_time="19:30", end_time="21:30", estimated_cost=round(daily_budget * 0.12, 2), category="food", travel_time_from_previous="5 min walk", booking_required=True),
            ],
            [
                Activity(name="Morning Coffee & Breakfast", description=f"Start the day at a charming café serving local pastries and specialty coffee in {dest}.", location=f"Central Market Area, {dest}", start_time="08:00", end_time="09:00", estimated_cost=round(daily_budget * 0.04, 2), category="food", travel_time_from_previous="N/A", booking_required=False),
                Activity(name="Traditional Market Visit", description=f"Explore {dest}'s bustling local market, filled with fresh produce, spices, crafts, and souvenirs.", location=f"Main Market, {dest}", start_time="09:30", end_time="11:30", estimated_cost=round(daily_budget * 0.06, 2), category="culture", travel_time_from_previous="10 min walk", booking_required=False),
                Activity(name="Cultural Heritage Museum", description=f"Discover the rich cultural history of {dest} through fascinating exhibits and artefacts.", location=f"National Museum, {dest}", start_time="12:00", end_time="14:00", estimated_cost=round(daily_budget * 0.05, 2), category="museum", travel_time_from_previous="15 min bus", booking_required=False),
                Activity(name="Lunch at Heritage Café", description="Enjoy a hearty lunch featuring traditional regional recipes in a heritage building.", location=f"Heritage Quarter, {dest}", start_time="14:00", end_time="15:30", estimated_cost=round(daily_budget * 0.09, 2), category="food", travel_time_from_previous="2 min walk", booking_required=False),
                Activity(name="Artisan Workshop Experience", description=f"Try your hand at a traditional craft in a local artisan workshop — a unique {dest} experience.", location=f"Artisan District, {dest}", start_time="16:00", end_time="18:00", estimated_cost=round(daily_budget * 0.10, 2), category="entertainment", travel_time_from_previous="10 min taxi", booking_required=True),
                Activity(name="Street Food Dinner Tour", description=f"End the evening with a self-guided street food tour through {dest}'s most vibrant food street.", location=f"Night Market, {dest}", start_time="19:00", end_time="21:00", estimated_cost=round(daily_budget * 0.10, 2), category="food", travel_time_from_previous="15 min walk", booking_required=False),
            ],
            [
                Activity(name="Early Breakfast at Hotel", description="Fuel up with a hotel breakfast before heading out for a full day in nature.", location=f"Hotel, {dest}", start_time="07:30", end_time="08:30", estimated_cost=round(daily_budget * 0.05, 2), category="food", travel_time_from_previous="N/A", booking_required=False),
                Activity(name="Scenic Nature Hike", description=f"Embark on a guided hike through {dest}'s stunning natural landscape. Moderate difficulty, beautiful vistas.", location=f"National Park, {dest}", start_time="09:00", end_time="12:00", estimated_cost=round(daily_budget * 0.08, 2), category="outdoor", travel_time_from_previous="30 min bus", booking_required=True),
                Activity(name="Picnic Lunch in Nature", description="Enjoy a packed lunch surrounded by nature — arrange with your hotel the evening before.", location=f"National Park Picnic Area, {dest}", start_time="12:00", end_time="13:00", estimated_cost=round(daily_budget * 0.06, 2), category="food", travel_time_from_previous="10 min walk", booking_required=False),
                Activity(name="Boat / Kayak Adventure", description=f"Paddle through {dest}'s scenic waterways on a guided kayak or boat tour.", location=f"River / Lake, {dest}", start_time="14:00", end_time="16:30", estimated_cost=round(daily_budget * 0.12, 2), category="adventure", travel_time_from_previous="15 min walk", booking_required=True),
                Activity(name="Sunset Bar / Rooftop Drinks", description="Wind down with refreshing drinks at a rooftop bar with spectacular views.", location=f"Rooftop Bar, {dest}", start_time="18:30", end_time="20:00", estimated_cost=round(daily_budget * 0.08, 2), category="entertainment", travel_time_from_previous="25 min taxi", booking_required=False),
                Activity(name="Casual Dinner", description="Dine at a cosy neighbourhood restaurant recommended by locals.", location=f"Local Neighbourhood, {dest}", start_time="20:30", end_time="22:00", estimated_cost=round(daily_budget * 0.10, 2), category="food", travel_time_from_previous="5 min walk", booking_required=False),
            ],
            [
                Activity(name="Breakfast & Newspaper Morning", description="Start slowly with breakfast at a riverside café and read the local paper.", location=f"Riverside Café, {dest}", start_time="08:30", end_time="09:30", estimated_cost=round(daily_budget * 0.05, 2), category="food", travel_time_from_previous="N/A", booking_required=False),
                Activity(name="Art Gallery Visit", description=f"Explore contemporary and classical art at {dest}'s premier art gallery.", location=f"City Art Gallery, {dest}", start_time="10:00", end_time="12:00", estimated_cost=round(daily_budget * 0.06, 2), category="museum", travel_time_from_previous="20 min metro", booking_required=False),
                Activity(name="Lunch at Museum Café", description="Enjoy a light lunch at the gallery café before the afternoon session.", location=f"Art Gallery Café, {dest}", start_time="12:00", end_time="13:00", estimated_cost=round(daily_budget * 0.08, 2), category="food", travel_time_from_previous="2 min walk", booking_required=False),
                Activity(name="Historical Landmarks Tour", description=f"Visit {dest}'s most important historical monuments and learn their stories from a local guide.", location=f"Historic District, {dest}", start_time="13:30", end_time="16:30", estimated_cost=round(daily_budget * 0.10, 2), category="sightseeing", travel_time_from_previous="10 min walk", booking_required=True),
                Activity(name="Evening Cultural Show", description=f"Watch a traditional cultural performance unique to {dest} — music, dance, and storytelling.", location=f"Cultural Centre, {dest}", start_time="19:00", end_time="21:00", estimated_cost=round(daily_budget * 0.12, 2), category="entertainment", travel_time_from_previous="20 min taxi", booking_required=True),
            ],
            [
                Activity(name="Farmers Market Breakfast", description="Grab freshly made breakfast items from the weekend farmers market.", location=f"Farmers Market, {dest}", start_time="08:00", end_time="09:00", estimated_cost=round(daily_budget * 0.05, 2), category="food", travel_time_from_previous="N/A", booking_required=False),
                Activity(name="Cooking Class", description=f"Learn to cook iconic {dest} dishes with a professional local chef — a hands-on foodie experience.", location=f"Culinary School, {dest}", start_time="09:30", end_time="12:30", estimated_cost=round(daily_budget * 0.15, 2), category="culture", travel_time_from_previous="15 min taxi", booking_required=True),
                Activity(name="Neighbourhood Café Hopping", description="Stroll through the trendiest neighbourhood, popping into indie cafes and boutiques.", location=f"Trendy Quarter, {dest}", start_time="13:00", end_time="15:00", estimated_cost=round(daily_budget * 0.07, 2), category="leisure", travel_time_from_previous="10 min bus", booking_required=False),
                Activity(name="Fine Dining Dinner", description=f"Celebrate a great trip with dinner at one of {dest}'s top-rated fine-dining restaurants.", location=f"Fine Dining District, {dest}", start_time="19:00", end_time="21:30", estimated_cost=round(daily_budget * 0.20, 2), category="food", travel_time_from_previous="25 min taxi", booking_required=True),
            ],
            [
                Activity(name="Breakfast & Departure Prep", description="Enjoy a last hotel breakfast and pack for the day trip.", location=f"Hotel, {dest}", start_time="07:30", end_time="08:30", estimated_cost=round(daily_budget * 0.05, 2), category="food", travel_time_from_previous="N/A", booking_required=False),
                Activity(name="Day Trip to Nearby Village / Town", description=f"Take a half-day trip to a charming nearby town or village for a change of scenery from {dest}.", location=f"Nearby Countryside, {dest} Region", start_time="09:00", end_time="13:00", estimated_cost=round(daily_budget * 0.15, 2), category="sightseeing", travel_time_from_previous="45 min bus", booking_required=False),
                Activity(name="Lunch at Countryside Restaurant", description="Savour regional specialties at a family-run countryside restaurant.", location=f"Village Restaurant, {dest} Region", start_time="13:00", end_time="14:30", estimated_cost=round(daily_budget * 0.10, 2), category="food", travel_time_from_previous="5 min walk", booking_required=False),
                Activity(name="Return & Spa / Relaxation", description="Return to the city and unwind with a spa session or pool time at the hotel.", location=f"Hotel Spa, {dest}", start_time="16:00", end_time="18:00", estimated_cost=round(daily_budget * 0.10, 2), category="leisure", travel_time_from_previous="45 min bus", booking_required=True),
                Activity(name="Rooftop Farewell Dinner", description=f"Enjoy a memorable farewell dinner on a rooftop with sweeping views of {dest}.", location=f"Rooftop Restaurant, {dest}", start_time="19:30", end_time="21:30", estimated_cost=round(daily_budget * 0.15, 2), category="food", travel_time_from_previous="15 min taxi", booking_required=True),
            ],
            [
                Activity(name="Leisurely Breakfast", description="Enjoy a long, relaxed breakfast at your favourite café discovered during the trip.", location=f"Favourite Café, {dest}", start_time="09:00", end_time="10:00", estimated_cost=round(daily_budget * 0.06, 2), category="food", travel_time_from_previous="N/A", booking_required=False),
                Activity(name="Last-Minute Shopping", description="Pick up souvenirs and gifts from the best local shops and boutiques.", location=f"Shopping Street, {dest}", start_time="10:30", end_time="12:30", estimated_cost=round(daily_budget * 0.15, 2), category="shopping", travel_time_from_previous="15 min walk", booking_required=False),
                Activity(name="Farewell Lunch", description="Toast to a wonderful trip over lunch at a scenic location.", location=f"Harbour / River, {dest}", start_time="13:00", end_time="14:30", estimated_cost=round(daily_budget * 0.12, 2), category="food", travel_time_from_previous="10 min taxi", booking_required=False),
                Activity(name="Airport Transfer & Departure", description=f"Check out and transfer to {dest} airport for your return journey.", location=f"{dest} International Airport", start_time="16:00", end_time="18:00", estimated_cost=round(daily_budget * 0.05, 2), category="transport", travel_time_from_previous="45 min taxi", booking_required=False),
            ],
        ]
        idx = theme_idx % len(templates)
        return templates[idx]

    daily_budget = budget / num_days if num_days > 0 else budget

    day_plans: list[DayPlan] = []
    for i, d in enumerate(days_list):
        theme_idx = i % len(day_themes)
        day_plans.append(
            DayPlan(
                day_number=i + 1,
                date=d.isoformat(),
                theme=day_themes[theme_idx],
                activities=make_activities(theme_idx, d, daily_budget),
            )
        )

    travel_tips = [
        f"Book accommodation in {dest} at least 3–4 weeks in advance, especially during peak season.",
        f"Download an offline map of {dest} before you arrive — mobile data can be unreliable in some areas.",
        f"Learn a few basic phrases in the local language; locals in {dest} greatly appreciate the effort.",
        f"Carry a reusable water bottle — {dest} has good tap water / many free refill stations.",
        f"Use public transport or rideshare apps to get around {dest} — it is often faster and cheaper than taxis.",
        f"Most attractions in {dest} are cheaper (or free) on weekday mornings — plan accordingly.",
        f"Purchase travel insurance before your trip to {dest} to cover medical emergencies and cancellations.",
        f"Keep digital and physical copies of all important documents when travelling in {dest}.",
    ]

    style_label = req.travel_style.capitalize()
    return ItineraryData(
        trip_title=f"[DEMO] {num_days}-Day {style_label} Trip to {dest}",
        destination=dest,
        summary=(
            f"This is a demo {num_days}-day {req.travel_style} itinerary for {travelers} "
            f"traveller(s) exploring {dest}, departing from {req.starting_location}. "
            f"The trip is crafted to fit a total budget of {budget} {currency}, "
            f"balancing sightseeing, culture, cuisine, and relaxation. "
            f"Enable a real OpenAI API key and set DEMO_MODE=false to generate a fully personalised itinerary."
        ),
        total_estimated_budget=budget,
        currency=currency,
        budget_breakdown=breakdown,
        days=day_plans,
        travel_tips=travel_tips,
    )


def _build_demo_day(req: RegenerateDayRequest) -> DayPlan:
    """Return a freshly generated demo day for the requested day number."""
    dest = req.current_itinerary.get("destination", "your destination")
    currency = req.current_itinerary.get("currency", "USD")

    # Pick the day date from current itinerary
    day_date = None
    for d in req.current_itinerary.get("days", []):
        if d.get("day_number") == req.day_number:
            day_date = d.get("date", date.today().isoformat())
            break
    if day_date is None:
        day_date = date.today().isoformat()

    instructions_note = ""
    if req.special_instructions:
        instructions_note = f" (Note: {req.special_instructions})"

    activities = [
        Activity(name=f"[DEMO] Morning Yoga & Meditation{instructions_note}", description=f"Start day {req.day_number} with a refreshing yoga session overlooking {dest}.", location=f"Rooftop / Park, {dest}", start_time="07:00", end_time="08:00", estimated_cost=0.0, category="leisure", travel_time_from_previous="N/A", booking_required=False),
        Activity(name="Brunch at Local Bistro", description=f"Enjoy a hearty brunch at a popular bistro in {dest}.", location=f"Bistro District, {dest}", start_time="09:00", end_time="10:30", estimated_cost=20.0, category="food", travel_time_from_previous="10 min walk", booking_required=False),
        Activity(name="Alternative Sightseeing Tour", description=f"Explore a lesser-known but equally fascinating side of {dest} on a local-led alternative tour.", location=f"Hidden Gems Area, {dest}", start_time="11:00", end_time="13:30", estimated_cost=35.0, category="sightseeing", travel_time_from_previous="15 min taxi", booking_required=True),
        Activity(name="Lunch at Street Food Stall", description="Sample the best street food vendors in the area, voted by locals.", location=f"Street Food Row, {dest}", start_time="13:30", end_time="14:30", estimated_cost=15.0, category="food", travel_time_from_previous="5 min walk", booking_required=False),
        Activity(name="Afternoon Museum / Gallery", description=f"Visit a specialised museum or gallery you haven't seen yet in {dest}.", location=f"Museum Quarter, {dest}", start_time="15:00", end_time="17:00", estimated_cost=12.0, category="museum", travel_time_from_previous="20 min metro", booking_required=False),
        Activity(name="Evening Jazz / Live Music", description="Enjoy live music at a cosy bar — {dest} has a vibrant live-music scene.", location=f"Music Bar, {dest}", start_time="20:00", end_time="22:30", estimated_cost=25.0, category="entertainment", travel_time_from_previous="10 min walk", booking_required=False),
    ]

    return DayPlan(
        day_number=req.day_number,
        date=day_date,
        theme="Regenerated Day — New Discoveries",
        activities=activities,
    )


# ---------------------------------------------------------------------------
# OpenAI calls
# ---------------------------------------------------------------------------

async def _call_openai_for_itinerary(req: GenerateItineraryRequest) -> ItineraryData:
    """Call OpenAI and parse the returned JSON into ItineraryData."""
    try:
        from openai import AsyncOpenAI, APIError, APIConnectionError, RateLimitError
    except ImportError as exc:
        raise RuntimeError("openai package is not installed.") from exc

    client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": _build_system_prompt()},
                {"role": "user", "content": _build_user_prompt(req)},
            ],
            temperature=0.7,
            max_tokens=4096,
        )
    except RateLimitError as exc:
        logger.error("OpenAI rate limit exceeded: %s", exc)
        raise RuntimeError("OpenAI rate limit exceeded. Please try again later.") from exc
    except APIConnectionError as exc:
        logger.error("OpenAI connection error: %s", exc)
        raise RuntimeError("Could not connect to OpenAI. Check your internet connection.") from exc
    except APIError as exc:
        logger.error("OpenAI API error: %s", exc)
        raise RuntimeError(f"OpenAI API error: {exc}") from exc

    raw_json = response.choices[0].message.content or "{}"
    try:
        data = json.loads(raw_json)
    except json.JSONDecodeError as exc:
        logger.error("Failed to parse OpenAI JSON response: %s", raw_json[:500])
        raise RuntimeError("OpenAI returned invalid JSON.") from exc

    try:
        return ItineraryData(**data)
    except Exception as exc:
        logger.error("OpenAI response did not match ItineraryData schema: %s", exc)
        raise RuntimeError("OpenAI response did not match expected itinerary schema.") from exc


async def _call_openai_for_day(req: RegenerateDayRequest) -> DayPlan:
    """Call OpenAI to regenerate a single day and parse into DayPlan."""
    try:
        from openai import AsyncOpenAI, APIError, APIConnectionError, RateLimitError
    except ImportError as exc:
        raise RuntimeError("openai package is not installed.") from exc

    client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

    system_prompt = (
        "You are an expert travel planner. Regenerate a single day's itinerary as requested. "
        "Return ONLY valid JSON matching the schema — no markdown, no extra keys."
    )

    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": _build_day_regen_prompt(req)},
            ],
            temperature=0.8,
            max_tokens=2048,
        )
    except RateLimitError as exc:
        raise RuntimeError("OpenAI rate limit exceeded.") from exc
    except APIConnectionError as exc:
        raise RuntimeError("Could not connect to OpenAI.") from exc
    except APIError as exc:
        raise RuntimeError(f"OpenAI API error: {exc}") from exc

    raw_json = response.choices[0].message.content or "{}"
    try:
        data = json.loads(raw_json)
    except json.JSONDecodeError as exc:
        raise RuntimeError("OpenAI returned invalid JSON for day regeneration.") from exc

    try:
        return DayPlan(**data)
    except Exception as exc:
        raise RuntimeError("OpenAI response did not match DayPlan schema.") from exc


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

async def generate_itinerary(request: GenerateItineraryRequest) -> ItineraryData:
    """
    Generate a full trip itinerary.
    Uses demo data when DEMO_MODE=true or no real API key is configured.
    """
    if settings.is_demo:
        logger.info("DEMO MODE: returning sample itinerary for '%s'", request.destination)
        return _build_demo_itinerary(request)

    logger.info("Calling OpenAI to generate itinerary for '%s'", request.destination)
    return await _call_openai_for_itinerary(request)


async def regenerate_day(request: RegenerateDayRequest) -> DayPlan:
    """
    Regenerate a single day in the itinerary.
    Uses demo data when DEMO_MODE=true or no real API key is configured.
    """
    if settings.is_demo:
        logger.info("DEMO MODE: regenerating day %d", request.day_number)
        return _build_demo_day(request)

    logger.info("Calling OpenAI to regenerate day %d", request.day_number)
    return await _call_openai_for_day(request)
