"""
TravelMate AI - Integration & End-to-End API Test Suite
Tests all endpoints: Health, Destinations, AI Itinerary Generation, Trips CRUD, and PDF Export
"""
import sys
import json
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_all():
    print("========================================")
    print(" Running TravelMate AI Test Suite")
    print("========================================")

    # 1. Health check
    print("\n[1/6] Testing GET /api/health...")
    res = client.get("/api/health")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    health_data = res.json()
    assert health_data["status"] == "ok"
    print(f"  --> PASS! Status: {health_data['status']}, Demo Mode: {health_data['demo_mode']}")

    # 2. Destinations list
    print("\n[2/6] Testing GET /api/destinations...")
    res = client.get("/api/destinations")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    dest_data = res.json()
    destinations = dest_data.get("destinations", [])
    assert len(destinations) > 0, "No destinations returned"
    print(f"  --> PASS! Loaded {len(destinations)} popular destinations (e.g. {destinations[0]['name']})")

    # 3. Trips CRUD
    print("\n[3/6] Testing Trips CRUD (POST & GET /api/trips)...")
    new_trip = {
        "destination": "Rome, Italy",
        "starting_location": "London Heathrow (LHR)",
        "start_date": "2024-09-10",
        "end_date": "2024-09-15",
        "travelers": 2,
        "budget": 2000.0,
        "currency": "EUR",
        "travel_style": "moderate",
        "preferences": {
            "interests": ["History", "Food", "Culture"],
            "accommodation_type": "Hotel",
            "transportation": "Walking",
            "dietary": ["No restrictions"],
            "activity_intensity": "balanced",
            "additional_instructions": "Focus on historic ruins and authentic trattorias."
        }
    }
    res = client.post("/api/trips", json=new_trip, headers={"Authorization": "Bearer demo-token"})
    assert res.status_code in [200, 201], f"Trip creation failed: {res.status_code}: {res.text}"
    trip_data = res.json()
    trip_id = trip_data["id"]
    print(f"  --> Created trip with ID: {trip_id}")

    # Fetch all trips
    res = client.get("/api/trips", headers={"Authorization": "Bearer demo-token"})
    assert res.status_code == 200
    trips_list = res.json()
    assert len(trips_list) > 0
    print(f"  --> PASS! Trips list returned {len(trips_list)} trips.")

    # 4. Generate AI Itinerary
    print("\n[4/6] Testing AI Itinerary Generation (/api/ai/generate-itinerary)...")
    gen_req = {
        "trip_id": trip_id,
        "destination": "Rome, Italy",
        "starting_location": "London Heathrow (LHR)",
        "start_date": "2024-09-10",
        "end_date": "2024-09-15",
        "travelers": 2,
        "budget": 2000.0,
        "currency": "EUR",
        "travel_style": "moderate",
        "preferences": {
            "interests": ["History", "Food"],
            "accommodation_type": "Hotel",
            "transportation": "Mixed",
            "dietary": [],
            "activity_intensity": "balanced",
            "additional_instructions": ""
        }
    }
    res = client.post("/api/ai/generate-itinerary", json=gen_req, headers={"Authorization": "Bearer demo-token"})
    assert res.status_code == 200, f"AI generation failed: {res.status_code}: {res.text}"
    itin_data = res.json()
    assert "days" in itin_data, "No days field in response"
    assert len(itin_data["days"]) > 0, "No days generated"
    assert "budget_breakdown" in itin_data, "No budget_breakdown in response"
    print(f"  --> PASS! Generated '{itin_data['trip_title']}' with {len(itin_data['days'])} days of activities!")

    # 5. Day Regeneration
    print("\n[5/6] Testing Single Day Regeneration (/api/ai/regenerate-day)...")
    day_req = {
        "trip_id": trip_id,
        "day_number": 1,
        "current_itinerary": itin_data,
        "special_instructions": "Switch afternoon activity to a cooking class"
    }
    res = client.post("/api/ai/regenerate-day", json=day_req, headers={"Authorization": "Bearer demo-token"})
    assert res.status_code == 200, f"Day regeneration failed: {res.status_code}: {res.text}"
    updated_itin = res.json()
    print(f"  --> PASS! Day 1 successfully regenerated.")

    # 6. PDF Export
    print("\n[6/6] Testing PDF Export (/api/trips/{trip_id}/download-pdf)...")
    res = client.get(f"/api/trips/{trip_id}/download-pdf", headers={"Authorization": "Bearer demo-token"})
    assert res.status_code == 200, f"PDF export failed: {res.status_code}: {res.text}"
    assert res.headers.get("content-type") == "application/pdf"
    pdf_size = len(res.content)
    assert pdf_size > 500, f"PDF too small: {pdf_size} bytes"
    print(f"  --> PASS! PDF generated successfully ({pdf_size} bytes).")

    print("\n========================================")
    print(" ALL 6/6 API TESTS PASSED SUCCESSFULLY!")
    print("========================================")

if __name__ == "__main__":
    try:
        test_all()
    except Exception as e:
        print(f"\nTEST FAILED: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)
