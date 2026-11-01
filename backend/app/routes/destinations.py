"""
Destinations router — returns a curated list of popular travel destinations.
"""
from __future__ import annotations

from fastapi import APIRouter

router = APIRouter(tags=["destinations"])

DESTINATIONS = [
    {
        "id": "paris",
        "name": "Paris",
        "country": "France",
        "image_url": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&auto=format&fit=crop",
        "description": "The City of Light dazzles with iconic landmarks, world-class cuisine, and vibrant culture.",
        "best_time": "April to June, September to November",
        "continent": "Europe",
        "tags": ["romantic", "art", "food", "history"],
    },
    {
        "id": "tokyo",
        "name": "Tokyo",
        "country": "Japan",
        "image_url": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&auto=format&fit=crop",
        "description": "A dazzling blend of ultra-modern technology and ancient tradition, with unmatched food and culture.",
        "best_time": "March to May, September to November",
        "continent": "Asia",
        "tags": ["technology", "food", "culture", "anime"],
    },
    {
        "id": "new-york",
        "name": "New York City",
        "country": "USA",
        "image_url": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&auto=format&fit=crop",
        "description": "The city that never sleeps offers world-famous skylines, diverse neighbourhoods, and endless entertainment.",
        "best_time": "April to June, September to November",
        "continent": "North America",
        "tags": ["urban", "food", "art", "entertainment"],
    },
    {
        "id": "bali",
        "name": "Bali",
        "country": "Indonesia",
        "image_url": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&auto=format&fit=crop",
        "description": "Tropical paradise with stunning rice terraces, Hindu temples, lush jungles, and world-class surf.",
        "best_time": "April to October",
        "continent": "Asia",
        "tags": ["beach", "wellness", "culture", "adventure"],
    },
    {
        "id": "rome",
        "name": "Rome",
        "country": "Italy",
        "image_url": "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&auto=format&fit=crop",
        "description": "The Eternal City is a living museum of ancient history, exquisite art, and extraordinary food.",
        "best_time": "April to May, September to October",
        "continent": "Europe",
        "tags": ["history", "food", "art", "architecture"],
    },
    {
        "id": "sydney",
        "name": "Sydney",
        "country": "Australia",
        "image_url": "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&auto=format&fit=crop",
        "description": "Harbour city with golden beaches, iconic Opera House, and a vibrant cosmopolitan lifestyle.",
        "best_time": "September to November, March to May",
        "continent": "Oceania",
        "tags": ["beach", "urban", "outdoor", "food"],
    },
    {
        "id": "barcelona",
        "name": "Barcelona",
        "country": "Spain",
        "image_url": "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&auto=format&fit=crop",
        "description": "Gaudí's architectural masterpieces, vibrant nightlife, Mediterranean beaches, and incredible tapas.",
        "best_time": "May to June, September to October",
        "continent": "Europe",
        "tags": ["art", "beach", "nightlife", "food"],
    },
    {
        "id": "dubai",
        "name": "Dubai",
        "country": "UAE",
        "image_url": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&auto=format&fit=crop",
        "description": "A city of superlatives — towering skyscrapers, luxury shopping, desert safaris, and golden shores.",
        "best_time": "November to March",
        "continent": "Middle East",
        "tags": ["luxury", "shopping", "desert", "modern"],
    },
    {
        "id": "machu-picchu",
        "name": "Machu Picchu",
        "country": "Peru",
        "image_url": "https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800&auto=format&fit=crop",
        "description": "The legendary Inca citadel set high in the Andes — one of the world's most breathtaking sites.",
        "best_time": "May to September",
        "continent": "South America",
        "tags": ["history", "adventure", "hiking", "UNESCO"],
    },
    {
        "id": "santorini",
        "name": "Santorini",
        "country": "Greece",
        "image_url": "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&auto=format&fit=crop",
        "description": "Volcanic island famed for its white-washed buildings, blue-domed churches, and spectacular sunsets.",
        "best_time": "June to September",
        "continent": "Europe",
        "tags": ["romantic", "beach", "photography", "food"],
    },
    {
        "id": "amsterdam",
        "name": "Amsterdam",
        "country": "Netherlands",
        "image_url": "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800&auto=format&fit=crop",
        "description": "City of canals, world-class museums, cycling culture, and a famously open and cosmopolitan spirit.",
        "best_time": "April to May, September to October",
        "continent": "Europe",
        "tags": ["culture", "art", "cycling", "canals"],
    },
    {
        "id": "cape-town",
        "name": "Cape Town",
        "country": "South Africa",
        "image_url": "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800&auto=format&fit=crop",
        "description": "Dramatic Table Mountain backdrop, stunning beaches, vibrant food scene, and rich cultural heritage.",
        "best_time": "November to March",
        "continent": "Africa",
        "tags": ["nature", "beach", "adventure", "food"],
    },
    {
        "id": "singapore",
        "name": "Singapore",
        "country": "Singapore",
        "image_url": "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&auto=format&fit=crop",
        "description": "Futuristic city-state blending stunning architecture, incredible street food, and lush urban gardens.",
        "best_time": "February to April",
        "continent": "Asia",
        "tags": ["food", "modern", "gardens", "shopping"],
    },
    {
        "id": "istanbul",
        "name": "Istanbul",
        "country": "Turkey",
        "image_url": "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&auto=format&fit=crop",
        "description": "Where Europe meets Asia — mosques, bazaars, Bosphorus cruises, and legendary Turkish cuisine.",
        "best_time": "April to May, September to November",
        "continent": "Europe/Asia",
        "tags": ["history", "culture", "food", "bazaar"],
    },
    {
        "id": "maldives",
        "name": "Maldives",
        "country": "Maldives",
        "image_url": "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&auto=format&fit=crop",
        "description": "Idyllic overwater bungalows, crystal-clear lagoons, coral reefs, and some of the world's best diving.",
        "best_time": "November to April",
        "continent": "Asia",
        "tags": ["beach", "luxury", "diving", "romantic"],
    },
    {
        "id": "kyoto",
        "name": "Kyoto",
        "country": "Japan",
        "image_url": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&auto=format&fit=crop",
        "description": "Japan's cultural heart — ancient temples, traditional tea ceremonies, geisha districts, and bamboo forests.",
        "best_time": "March to May, October to November",
        "continent": "Asia",
        "tags": ["culture", "temples", "nature", "history"],
    },
    {
        "id": "rio-de-janeiro",
        "name": "Rio de Janeiro",
        "country": "Brazil",
        "image_url": "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&auto=format&fit=crop",
        "description": "Carnival city of samba, Christ the Redeemer, Copacabana beach, and breathtaking mountain scenery.",
        "best_time": "December to March",
        "continent": "South America",
        "tags": ["beach", "carnival", "music", "nature"],
    },
    {
        "id": "new-zealand",
        "name": "Queenstown",
        "country": "New Zealand",
        "image_url": "https://images.unsplash.com/photo-1469521669194-babb45599def?w=800&auto=format&fit=crop",
        "description": "Adventure capital of the world — bungee jumping, skiing, stunning fjords, and Lord of the Rings scenery.",
        "best_time": "December to February, June to August",
        "continent": "Oceania",
        "tags": ["adventure", "nature", "skiing", "outdoor"],
    },
]


@router.get("/api/destinations")
async def get_destinations():
    """Return a curated list of popular travel destinations."""
    return {
        "destinations": DESTINATIONS,
        "total": len(DESTINATIONS),
    }


@router.get("/api/destinations/{destination_id}")
async def get_destination(destination_id: str):
    """Return a single destination by its ID."""
    for dest in DESTINATIONS:
        if dest["id"] == destination_id:
            return dest
    from fastapi import HTTPException, status
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Destination '{destination_id}' not found.",
    )
