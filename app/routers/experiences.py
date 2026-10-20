import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Experience
from app.schemas import ExperienceOut, ExperienceDetail

from datetime import datetime

router = APIRouter(prefix="/api/experiences", tags=["Experiences"])
integration_router = APIRouter(prefix="/api/integration", tags=["Smart Travel Planner Integration"])

RECEIVED_INTEGRATION_REQUESTS = []
_request_counter = 1

def record_integration_request(
    destination: Optional[str],
    category: Optional[str],
    search: Optional[str],
    travellers: Optional[int],
    budget: Optional[float],
    trip_id: Optional[int],
    client: Optional[str],
    results_count: int,
    sample_places: List[str]
):
    global _request_counter
    rec = {
        "id": _request_counter,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "client": client or "Smart Travel Planner (:8000)",
        "destination": destination or "All India",
        "category": category or "All",
        "search": search or "",
        "travellers": travellers,
        "budget": budget,
        "trip_id": trip_id,
        "places_found": results_count,
        "sample_places": sample_places,
        "status": "HTTP 200 OK"
    }
    RECEIVED_INTEGRATION_REQUESTS.insert(0, rec)
    _request_counter += 1
    if len(RECEIVED_INTEGRATION_REQUESTS) > 100:
        RECEIVED_INTEGRATION_REQUESTS.pop()
    return rec

@integration_router.get("/live-requests")
def get_live_integration_requests():
    """Returns real-time server-to-server request stream from Smart Travel Planner."""
    return {
        "service": "Explorely Experience Finder (:8001)",
        "peer_service": "Smart Travel Planner (:8000)",
        "total_received": len(RECEIVED_INTEGRATION_REQUESTS),
        "requests": RECEIVED_INTEGRATION_REQUESTS
    }

@integration_router.post("/live-requests/clear")
def clear_live_integration_requests():
    """Clears the recorded server-to-server request log."""
    global RECEIVED_INTEGRATION_REQUESTS
    RECEIVED_INTEGRATION_REQUESTS.clear()
    return {"status": "cleared", "total_received": 0}

@router.get("", response_model=List[ExperienceOut])
def get_experiences(
    destination: Optional[str] = None,
    category: Optional[str] = None,
    min_rating: Optional[float] = None,
    max_price: Optional[int] = None,
    search: Optional[str] = None,
    travellers: Optional[int] = None,
    budget: Optional[float] = None,
    trip_id: Optional[int] = None,
    client: Optional[str] = None,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    query = db.query(Experience)

    if destination:
        dest_clean = destination.strip()
        if dest_clean.lower() not in ("all", "all india", "any", ""):
            primary_dest = dest_clean.split(",")[0].strip()
            # Extract word stem to gracefully handle transliteration variants like Munnaru -> Munnar, Cochini -> Cochin
            stem = primary_dest.rstrip("uaieo").strip()
            dest_filter = (
                Experience.destination.ilike(f"%{dest_clean}%") |
                Experience.destination.ilike(f"%{primary_dest}%") |
                Experience.locality.ilike(f"%{primary_dest}%") |
                Experience.name.ilike(f"%{primary_dest}%")
            )
            if len(stem) >= 3:
                dest_filter = dest_filter | (
                    Experience.destination.ilike(f"%{stem}%") |
                    Experience.locality.ilike(f"%{stem}%") |
                    Experience.name.ilike(f"%{stem}%")
                )
            if "," in dest_clean:
                sec_part = dest_clean.split(",")[1].strip()
                if sec_part:
                    dest_filter = dest_filter | Experience.locality.ilike(f"%{sec_part}%") | Experience.description.ilike(f"%{sec_part}%")
            query = query.filter(dest_filter)

    if category and category.strip().lower() not in ("all", "all categories", "any", ""):
        query = query.filter(Experience.category.ilike(f"%{category.strip()}%"))

    if min_rating is not None:
        query = query.filter(Experience.rating >= min_rating)

    if max_price is not None:
        query = query.filter(Experience.price <= max_price)

    if search and search.strip():
        s = search.strip()
        query = query.filter(
            (Experience.name.ilike(f"%{s}%")) |
            (Experience.description.ilike(f"%{s}%")) |
            (Experience.locality.ilike(f"%{s}%")) |
            (Experience.destination.ilike(f"%{s}%")) |
            (Experience.category.ilike(f"%{s}%"))
        )

    limit_val = int(limit) if isinstance(limit, (int, str)) else 50
    offset_val = int(offset) if isinstance(offset, (int, str)) else 0
    results = query.offset(offset_val).limit(limit_val).all()
    sample_places = [e.name for e in results[:4]]
    record_integration_request(
        destination=destination,
        category=category,
        search=search,
        travellers=travellers,
        budget=budget,
        trip_id=trip_id,
        client=client or ("Smart Travel Planner (:8000)" if (travellers or budget or trip_id or client) else "Direct API / Browser Client"),
        results_count=len(results),
        sample_places=sample_places
    )
    return results


@router.get("/{id}", response_model=ExperienceDetail)
def get_experience(id: int, db: Session = Depends(get_db)):
    exp = db.query(Experience).filter(Experience.experience_id == id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experience not found")

    # Deserialize JSON fields
    gallery = json.loads(exp.gallery_json) if exp.gallery_json else [exp.image_url]
    highlights = json.loads(exp.highlights_json) if exp.highlights_json else []
    itinerary = json.loads(exp.itinerary_json) if exp.itinerary_json else []

    data = {
        "experience_id": exp.experience_id,
        "name": exp.name,
        "destination": exp.destination,
        "locality": exp.locality,
        "category": exp.category,
        "description": exp.description,
        "price": exp.price,
        "rating": exp.rating,
        "review_count": exp.review_count,
        "duration": exp.duration,
        "duration_category": exp.duration_category,
        "best_time": exp.best_time,
        "group_size": exp.group_size,
        "guide": exp.guide,
        "address": exp.address,
        "latitude": exp.latitude,
        "longitude": exp.longitude,
        "image_url": exp.image_url,
        "gallery": gallery,
        "highlights": highlights,
        "itinerary": itinerary
    }
    return data
