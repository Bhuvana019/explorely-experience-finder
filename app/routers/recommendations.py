"""Deterministic recommendation engine for Project 1 (Smart Travel Planner).

match_score is computed from a transparent, rule-based algorithm — it is never
fabricated. Target weights: Interest 40%, Budget fit 25%, Rating quality 20%,
Popularity 15%. Signals that cannot be evaluated for an item (no budget given,
no verified price, no Explorely reviews yet) are DROPPED and the remaining
weights are renormalised, so an item is never penalised or boosted by data we
simply do not have. Every component is returned in score_breakdown.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Experience
from app.schemas import RecommendationResponse

router = APIRouter(prefix="/api/recommendations", tags=["Project 1 Integration Bridge"])

BASE_WEIGHTS = {
    "interest": 0.40,
    "budget": 0.25,
    "rating": 0.20,
    "popularity": 0.15,
}


def _representative_price(exp: Experience) -> Optional[int]:
    """Cheapest real figure we hold: exact price, else the low end of a range."""
    if exp.price is not None:
        return exp.price
    return exp.price_min


@router.get("", response_model=RecommendationResponse)
def get_recommendations(
    destination: Optional[str] = None,
    category: Optional[str] = None,
    interests: Optional[str] = Query(None, description="Comma-separated categories, e.g. Adventure,Food"),
    budget: Optional[int] = Query(None, ge=0, description="Per-person budget in INR"),
    guests: Optional[int] = Query(None, ge=1, le=50),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
):
    query = db.query(Experience)

    if destination and destination.lower() != "all india":
        query = query.filter(Experience.destination.ilike(f"%{destination}%"))
    if category and category.lower() != "all categories":
        query = query.filter(Experience.category.ilike(f"%{category}%"))

    candidates = query.all()

    interest_set = {i.strip().lower() for i in (interests or "").split(",") if i.strip()}
    max_reviews = max((e.review_count or 0) for e in candidates) if candidates else 0

    results = []
    for exp in candidates:
        signals = {}   # name -> raw score in [0,1]
        reasons = []

        # Interest (40%) — only when the caller supplied interests.
        if interest_set:
            hit = (exp.category or "").lower() in interest_set
            signals["interest"] = 1.0 if hit else 0.0
            if hit:
                reasons.append(f"Matches your interest in {exp.category}.")

        # Budget fit (25%) — only when a budget is given AND we hold a real price.
        rep = _representative_price(exp)
        if budget and budget > 0:
            if rep is not None:
                if rep <= budget:
                    signals["budget"] = 1.0
                    reasons.append(f"Within your ₹{budget:,} per-person budget.")
                else:
                    over = (rep - budget) / budget
                    signals["budget"] = max(0.0, 1.0 - over)
                    reasons.append(f"Above your per-person budget (about ₹{rep:,}).")
            else:
                reasons.append("Price not verified — excluded from budget scoring.")

        # Rating quality (20%) — only when real Explorely reviews exist.
        if exp.rating is not None and (exp.review_count or 0) > 0:
            signals["rating"] = max(0.0, min(1.0, exp.rating / 5.0))
            reasons.append(f"Rated {exp.rating:.1f} from {exp.review_count} Explorely review(s).")
        else:
            reasons.append("No Explorely reviews yet.")

        # Popularity (15%) — review volume, only meaningful if any item has reviews.
        if max_reviews > 0 and (exp.review_count or 0) > 0:
            signals["popularity"] = (exp.review_count or 0) / max_reviews

        # Renormalise over the signals that were actually evaluated.
        used_weight = sum(BASE_WEIGHTS[k] for k in signals)
        if used_weight > 0:
            score = sum(BASE_WEIGHTS[k] * signals[k] for k in signals) / used_weight
        else:
            score = 0.0

        results.append({
            "experience_id": exp.experience_id,
            "name": exp.name,
            "destination": exp.destination,
            "locality": exp.locality,
            "category": exp.category,
            "pricing_type": exp.pricing_type,
            "price": exp.price,
            "price_min": exp.price_min,
            "price_max": exp.price_max,
            "currency": exp.currency,
            "duration": exp.duration,
            "rating": exp.rating,
            "review_count": exp.review_count or 0,
            "image_url": exp.image_url,
            "match_score": round(score * 100, 1),
            "score_breakdown": {
                "weights": BASE_WEIGHTS,
                "signals_used": {k: round(v, 3) for k, v in signals.items()},
                "signals_omitted": [k for k in BASE_WEIGHTS if k not in signals],
                "normalised_weight": round(used_weight, 3),
            },
            "reasons": reasons,
        })

    results.sort(key=lambda r: (-r["match_score"], r["name"]))
    results = results[:limit]

    return {
        "query": {
            "destination": destination,
            "category": category,
            "interests": sorted(interest_set) if interest_set else None,
            "budget": budget,
            "guests": guests,
            "start_date": start_date,
            "end_date": end_date,
            "note": (
                "Explorely holds no availability or calendar data, so start_date/"
                "end_date do not filter results; they are echoed for Project 1's "
                "own planning. guests is per-person context only."
            ),
        },
        "weights": BASE_WEIGHTS,
        "count": len(results),
        "results": results,
    }
