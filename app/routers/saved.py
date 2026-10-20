from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from app.database import get_db
from app.models import SavedExperience, SavedRestaurant, Experience, Restaurant, User
from app.security import get_current_user
from app.schemas import ExperienceOut, RestaurantOut, SavedExperienceCreate, SavedRestaurantCreate, Project1ExportResponse

router = APIRouter(prefix="/api/saved", tags=["Saved Items"])

# Saved Experiences
@router.get("/experiences", response_model=List[ExperienceOut])
def get_saved_experiences(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    saved = db.query(SavedExperience).filter(SavedExperience.user_id == current_user.user_id).all()
    exp_ids = [s.experience_id for s in saved]
    return db.query(Experience).filter(Experience.experience_id.in_(exp_ids)).all()


@router.post("/experiences", status_code=status.HTTP_201_CREATED)
def save_experience(payload: SavedExperienceCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    exp = db.query(Experience).filter(Experience.experience_id == payload.experience_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experience not found")

    existing = db.query(SavedExperience).filter(
        SavedExperience.user_id == current_user.user_id,
        SavedExperience.experience_id == payload.experience_id
    ).first()

    if not existing:
        new_save = SavedExperience(user_id=current_user.user_id, experience_id=payload.experience_id)
        db.add(new_save)
        db.commit()

    return {"message": "Experience saved successfully", "experience_id": payload.experience_id}


@router.delete("/experiences/{id}")
def remove_saved_experience(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    saved = db.query(SavedExperience).filter(
        SavedExperience.user_id == current_user.user_id,
        SavedExperience.experience_id == id
    ).first()

    if not saved:
        raise HTTPException(status_code=404, detail="Saved experience not found")

    db.delete(saved)
    db.commit()
    return {"message": "Experience removed from saved", "experience_id": id}


# Saved Restaurants
@router.get("/restaurants", response_model=List[RestaurantOut])
def get_saved_restaurants(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    saved = db.query(SavedRestaurant).filter(SavedRestaurant.user_id == current_user.user_id).all()
    rest_ids = [s.restaurant_id for s in saved]
    return db.query(Restaurant).filter(Restaurant.restaurant_id.in_(rest_ids)).all()


@router.post("/restaurants", status_code=status.HTTP_201_CREATED)
def save_restaurant(payload: SavedRestaurantCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    rest = db.query(Restaurant).filter(Restaurant.restaurant_id == payload.restaurant_id).first()
    if not rest:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    existing = db.query(SavedRestaurant).filter(
        SavedRestaurant.user_id == current_user.user_id,
        SavedRestaurant.restaurant_id == payload.restaurant_id
    ).first()

    if not existing:
        new_save = SavedRestaurant(user_id=current_user.user_id, restaurant_id=payload.restaurant_id)
        db.add(new_save)
        db.commit()

    return {"message": "Restaurant saved successfully", "restaurant_id": payload.restaurant_id}


@router.delete("/restaurants/{id}")
def remove_saved_restaurant(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    saved = db.query(SavedRestaurant).filter(
        SavedRestaurant.user_id == current_user.user_id,
        SavedRestaurant.restaurant_id == id
    ).first()

    if not saved:
        raise HTTPException(status_code=404, detail="Saved restaurant not found")

    db.delete(saved)
    db.commit()
    return {"message": "Restaurant removed from saved", "restaurant_id": id}


# Cross-Project Integration Spec: Export for Project 1 (Smart Travel Planner)
sync_router = APIRouter(prefix="/api/sync", tags=["Project 1 Integration Bridge"])

@sync_router.get("/export", response_model=Project1ExportResponse)
def export_for_project1(db: Session = Depends(get_db)):
    saved_exp = db.query(SavedExperience).all()
    exp_ids = [s.experience_id for s in saved_exp]
    experiences = db.query(Experience).filter(Experience.experience_id.in_(exp_ids)).all()

    saved_rest = db.query(SavedRestaurant).all()
    rest_ids = [s.restaurant_id for s in saved_rest]
    restaurants = db.query(Restaurant).filter(Restaurant.restaurant_id.in_(rest_ids)).all()

    user = db.query(User).filter(User.user_id == 1).first()

    destinations = list(set([e.destination for e in experiences] + [r.destination for r in restaurants]))
    total_val = sum(e.price for e in experiences)

    return {
        "application_source": "Explorely (Project 2 - Experience Finder)",
        "api_version": "v1.1.0",
        "export_timestamp": datetime.utcnow().isoformat(),
        "user": {
            "user_id": user.user_id if user else 1,
            "name": user.name if user else "Ananya Sharma",
            "email": user.email if user else "ananya@explorely.com"
        },
        "summary": {
            "total_experiences": len(experiences),
            "total_restaurants": len(restaurants),
            "destinations": destinations,
            "total_estimated_value_inr": total_val
        },
        "payload": {
            "experiences": [
                {
                    "experience_id": e.experience_id,
                    "name": e.name,
                    "destination": e.destination,
                    "category": e.category,
                    "price": e.price,
                    "duration": e.duration,
                    "rating": e.rating,
                    "latitude": e.latitude,
                    "longitude": e.longitude,
                    "image_url": e.image_url
                } for e in experiences
            ],
            "restaurants": [
                {
                    "restaurant_id": r.restaurant_id,
                    "name": r.name,
                    "destination": r.destination,
                    "cuisine": r.cuisine,
                    "price_range": r.price_range,
                    "rating": r.rating,
                    "image_url": r.image_url
                } for r in restaurants
            ]
        }
    }
