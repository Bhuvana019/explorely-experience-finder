from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(160), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    bio = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    reviews = relationship("Review", back_populates="user")
    saved_experiences = relationship("SavedExperience", back_populates="user")
    saved_restaurants = relationship("SavedRestaurant", back_populates="user")


class Experience(Base):
    __tablename__ = "experiences"

    experience_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False, index=True)
    destination = Column(String(100), nullable=False, index=True)
    locality = Column(String(150), nullable=True)
    category = Column(String(80), nullable=False, index=True)
    description = Column(Text, nullable=False)
    price = Column(Integer, nullable=False)
    rating = Column(Float, default=4.8)
    review_count = Column(Integer, default=0)
    duration = Column(String(60), nullable=True)
    duration_category = Column(String(40), default="half_day")
    best_time = Column(String(100), nullable=True)
    group_size = Column(String(60), nullable=True)
    guide = Column(String(100), nullable=True)
    address = Column(String(255), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    image_url = Column(String(500), nullable=False)
    gallery_json = Column(Text, nullable=True)
    highlights_json = Column(Text, nullable=True)
    itinerary_json = Column(Text, nullable=True)

    reviews = relationship("Review", back_populates="experience")
    saved_by = relationship("SavedExperience", back_populates="experience")


class Restaurant(Base):
    __tablename__ = "restaurants"

    restaurant_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False, index=True)
    destination = Column(String(100), nullable=False, index=True)
    locality = Column(String(150), nullable=True)
    cuisine = Column(String(120), nullable=False)
    description = Column(Text, nullable=False)
    price_range = Column(String(50), default="₹₹ (Moderate)")
    price_for_two = Column(Integer, nullable=True)
    rating = Column(Float, default=4.8)
    review_count = Column(Integer, default=0)
    address = Column(String(255), nullable=True)
    opening_hours = Column(String(100), nullable=True)
    must_try_json = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=False)

    saved_by = relationship("SavedRestaurant", back_populates="restaurant")


class Review(Base):
    __tablename__ = "reviews"

    review_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=True)
    experience_id = Column(Integer, ForeignKey("experiences.experience_id"), nullable=False, index=True)
    user_name = Column(String(120), nullable=False)
    rating = Column(Integer, nullable=False)
    comment = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="reviews")
    experience = relationship("Experience", back_populates="reviews")


class SavedExperience(Base):
    __tablename__ = "saved_experiences"

    saved_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False, index=True)
    experience_id = Column(Integer, ForeignKey("experiences.experience_id"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="saved_experiences")
    experience = relationship("Experience", back_populates="saved_by")


class SavedRestaurant(Base):
    __tablename__ = "saved_restaurants"

    saved_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False, index=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.restaurant_id"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="saved_restaurants")
    restaurant = relationship("Restaurant", back_populates="saved_by")
