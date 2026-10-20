from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models import Review, Experience, User
from app.security import get_current_user
from app.schemas import ReviewCreate, ReviewOut


router = APIRouter(prefix="/api/reviews", tags=["Reviews"])

exp_reviews_router = APIRouter(
    prefix="/api/experiences",
    tags=["Reviews"],
)


def serialize_review(review: Review):
    return {
        "review_id": review.review_id,
        "experience_id": review.experience_id,
        "user_name": review.user_name,
        "rating": review.rating,
        "comment": review.comment,
        "date": (
            review.created_at.strftime("%B %d, %Y")
            if review.created_at
            else "Recently"
        ),
        "created_at": review.created_at,
    }


def refresh_experience_rating(db: Session, experience: Experience):
    """Calculate rating and review count from actual saved reviews."""
    result = (
        db.query(
            func.avg(Review.rating),
            func.count(Review.review_id),
        )
        .filter(Review.experience_id == experience.experience_id)
        .first()
    )

    average, count = result or (None, 0)

    experience.rating = round(float(average), 1) if average is not None else 0.0
    experience.review_count = int(count or 0)


# Guests can read reviews without logging in.
@exp_reviews_router.get("/{id}/reviews", response_model=List[ReviewOut])
def get_experience_reviews(
    id: int,
    db: Session = Depends(get_db),
):
    experience = (
        db.query(Experience)
        .filter(Experience.experience_id == id)
        .first()
    )

    if not experience:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Experience not found",
        )

    reviews = (
        db.query(Review)
        .filter(Review.experience_id == id)
        .order_by(Review.created_at.desc())
        .all()
    )

    return [serialize_review(review) for review in reviews]


# Login is required to create a review.
@router.post(
    "",
    response_model=ReviewOut,
    status_code=status.HTTP_201_CREATED,
)
def create_review(
    payload: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    experience = (
        db.query(Experience)
        .filter(Experience.experience_id == payload.experience_id)
        .first()
    )

    if not experience:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Experience not found",
        )

    comment = payload.comment.strip()

    if not comment:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Review comment cannot be empty",
        )

    if not 1 <= payload.rating <= 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Rating must be between 1 and 5",
        )

    new_review = Review(
        user_id=current_user.user_id,
        experience_id=payload.experience_id,
        user_name=current_user.name,
        rating=payload.rating,
        comment=comment,
    )

    try:
        db.add(new_review)
        db.flush()

        refresh_experience_rating(db, experience)

        db.commit()
        db.refresh(new_review)

        return serialize_review(new_review)

    except Exception:
        db.rollback()
        raise
