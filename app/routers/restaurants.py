import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Restaurant
from app.schemas import RestaurantOut

router = APIRouter(prefix="/api/restaurants", tags=["Restaurants"])

@router.get("", response_model=List[RestaurantOut])
def get_restaurants(
    destination: Optional[str] = None,
    cuisine: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Restaurant)
    if destination and destination.lower() != "all india":
        query = query.filter(Restaurant.destination.ilike(f"%{destination}%"))
    if cuisine:
        query = query.filter(Restaurant.cuisine.ilike(f"%{cuisine}%"))

    results = query.all()
    out = []
    for r in results:
        must_try = json.loads(r.must_try_json) if r.must_try_json else []
        out.append({
            "restaurant_id": r.restaurant_id,
            "name": r.name,
            "destination": r.destination,
            "locality": r.locality,
            "cuisine": r.cuisine,
            "description": r.description,
            "price_range": r.price_range,
            "price_for_two": r.price_for_two,
            "rating": r.rating,
            "review_count": r.review_count,
            "address": r.address,
            "opening_hours": r.opening_hours,
            "must_try": must_try,
            "image_url": r.image_url
        })
    return out


@router.get("/{id}", response_model=RestaurantOut)
def get_restaurant(id: int, db: Session = Depends(get_db)):
    r = db.query(Restaurant).filter(Restaurant.restaurant_id == id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    must_try = json.loads(r.must_try_json) if r.must_try_json else []
    return {
        "restaurant_id": r.restaurant_id,
        "name": r.name,
        "destination": r.destination,
        "locality": r.locality,
        "cuisine": r.cuisine,
        "description": r.description,
        "price_range": r.price_range,
        "price_for_two": r.price_for_two,
        "rating": r.rating,
        "review_count": r.review_count,
        "address": r.address,
        "opening_hours": r.opening_hours,
        "must_try": must_try,
        "image_url": r.image_url
    }
