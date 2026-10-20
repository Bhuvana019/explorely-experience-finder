"""Install the curated South India starter catalogue.
Run from project root: python setup_south_india_catalogue.py
Safe by default: upserts matching names and adds missing entries; does not delete existing records.
All ratings/review counts start at zero. Restaurant records are inserted into Restaurant table.
"""
import json
from pathlib import Path
from app.database import SessionLocal
from app.models import Experience, Restaurant

DATA = Path(__file__).resolve().parent / "south_india_places.json"

def main():
    records=json.loads(DATA.read_text(encoding="utf-8"))
    added_exp=updated_exp=added_rest=updated_rest=0
    with SessionLocal() as db:
        for item in records:
            x=dict(item); kind=x.pop("record_type"); state=x.pop("state", None)
            # Preserve city destination as the existing app's destination/filter field.
            if kind == "restaurant":
                row=db.query(Restaurant).filter(Restaurant.name==x["name"], Restaurant.destination==x["destination"]).first()
                values={"name":x["name"],"destination":x["destination"],"locality":x["locality"],"cuisine":x["category"],
                  "description":x["description"],"price_range":"Estimated ₹₹ (confirm locally)","price_for_two":x["price"],
                  "rating":0.0,"review_count":0,"address":x["address"],"opening_hours":"Check with venue",
                  "must_try_json":json.dumps(["Check current menu with venue"]),"image_url":x["image_url"]}
                if row:
                    for k,v in values.items(): setattr(row,k,v)
                    updated_rest+=1
                else:
                    db.add(Restaurant(**values)); added_rest+=1
            else:
                row=db.query(Experience).filter(Experience.name==x["name"], Experience.destination==x["destination"]).first()
                values={k:x[k] for k in ["name","destination","locality","category","description","price","rating","review_count","duration","duration_category","best_time","group_size","guide","address","latitude","longitude","image_url","gallery_json","highlights_json","itinerary_json"]}
                if row:
                    # Keep any existing real review aggregate until the dedicated reconciliation step.
                    actual_count=int(row.review_count or 0)
                    for k,v in values.items():
                        if k not in ("rating","review_count"): setattr(row,k,v)
                    if actual_count > 0: values_rating=row.rating; values_count=row.review_count
                    else: row.rating=0.0; row.review_count=0
                    updated_exp+=1
                else:
                    db.add(Experience(**values)); added_exp+=1
        db.commit()
    print(f"South India catalogue installed: {len(records)} records")
    print(f"Experiences: {added_exp} added, {updated_exp} updated")
    print(f"Restaurants: {added_rest} added, {updated_rest} updated")
    print("No reviews were fabricated. New/updated listings without real reviews remain unrated.")
    print("Note: this script does not delete out-of-region records; use the API filter patch in the ZIP to show only the South India starter catalogue in Explore.")
if __name__ == "__main__": main()
