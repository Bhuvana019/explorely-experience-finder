from typing import List, Optional, Any
import re
from pydantic import BaseModel, field_validator
from datetime import datetime

# Experiences
class ExperienceBase(BaseModel):
    name: str
    destination: str
    locality: Optional[str] = None
    category: str
    description: str
    price: int
    duration: Optional[str] = None
    duration_category: Optional[str] = "half_day"
    best_time: Optional[str] = None
    group_size: Optional[str] = None
    guide: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    image_url: str

class ExperienceOut(ExperienceBase):
    experience_id: int
    rating: float
    review_count: int

    class Config:
        from_attributes = True

class ExperienceDetail(ExperienceOut):
    gallery: Optional[List[str]] = None
    highlights: Optional[List[str]] = None
    itinerary: Optional[List[dict]] = None

# Restaurants
class RestaurantBase(BaseModel):
    name: str
    destination: str
    locality: Optional[str] = None
    cuisine: str
    description: str
    price_range: str
    price_for_two: Optional[int] = None
    address: Optional[str] = None
    opening_hours: Optional[str] = None
    image_url: str

class RestaurantOut(RestaurantBase):
    restaurant_id: int
    rating: float
    review_count: int
    must_try: Optional[List[str]] = None

    class Config:
        from_attributes = True

# Reviews
class ReviewCreate(BaseModel):
    # The author is always the authenticated user; any user_id / user_name
    # sent by a client is ignored (extra fields are not stored).
    experience_id: int
    rating: int
    comment: str

class ReviewOut(BaseModel):
    review_id: int
    experience_id: int
    user_name: str
    rating: int
    comment: str
    date: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Saved
class SavedExperienceCreate(BaseModel):
    experience_id: int

class SavedRestaurantCreate(BaseModel):
    restaurant_id: int

# User Auth
_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

def _clean_email(value: str) -> str:
    value = (value or "").strip().lower()
    if not _EMAIL_RE.match(value) or len(value) > 160:
        raise ValueError("Please enter a valid email address")
    return value

class UserRegister(BaseModel):
    name: str
    email: str
    password: str

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        v = (v or "").strip()
        if len(v) < 2:
            raise ValueError("Name must be at least 2 characters")
        if len(v) > 120:
            raise ValueError("Name must be at most 120 characters")
        return v

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        return _clean_email(v)

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if len(v.encode("utf-8")) > 72:
            raise ValueError("Password must be at most 72 bytes")
        return v

class UserLogin(BaseModel):
    email: str
    password: str

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return (v or "").strip().lower()

class UserOut(BaseModel):
    user_id: int
    name: str
    email: str
    bio: Optional[str] = None

    class Config:
        from_attributes = True

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

# Project 1 Export Contract
class Project1ExportResponse(BaseModel):
    application_source: str
    api_version: str
    export_timestamp: str
    user: dict
    summary: dict
    payload: dict
