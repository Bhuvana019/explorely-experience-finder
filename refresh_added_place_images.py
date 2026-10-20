"""Refresh images for the 53 added Explorely places using Wikimedia Commons.
Run from the project root: python refresh_added_place_images.py
Requires requests (already in requirements.txt). It updates only the places listed in
explorely_additional_places.json. If no convincing Commons match is found, it leaves
that place's current image unchanged and logs it for manual review.
"""
import json, re, time
from pathlib import Path
import requests
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Experience, Review

ROOT = Path(__file__).resolve().parent
DATA_FILE = ROOT / "explorely_additional_places.json"
IMAGE_DIR = ROOT / "app" / "static" / "images" / "places"
API = "https://commons.wikimedia.org/w/api.php"
HEADERS = {"User-Agent": "ExplorelyPlaceImageRefresh/1.0 (local travel discovery project)"}
STOP = {"visit","tour","walk","photo","stop","sunrise","sunset","heritage","explore","experience","view","trip","day","the","and","in","of","at","for","india","activity","point","temple","fort","lake","beach","national","park","museum","caves","falls","waterfall","palace","city","river","valley","island","garden","sanctuary","monastery","church","market","ghat","hill","peak","reserve"}

def tokens(text):
    return {w for w in re.findall(r"[a-z0-9]+", (text or "").lower()) if len(w) > 2 and w not in STOP}

def slug(text):
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")[:80]

def search_image(place):
    name_tokens = tokens(place["name"])
    locality_tokens = tokens(place.get("locality"))
    destination_tokens = tokens(place.get("destination"))
    # Query with the landmark name first; location helps distinguish similarly named places.
    query = " ".join(sorted(name_tokens) + sorted(destination_tokens)) or place["name"]
    response = requests.get(API, params={
        "action":"query", "format":"json", "generator":"search", "gsrsearch":query,
        "gsrnamespace":6, "gsrlimit":15, "prop":"imageinfo", "iiprop":"url|mime",
        "iiurlwidth":1400
    }, headers=HEADERS, timeout=25)
    response.raise_for_status()
    pages = response.json().get("query", {}).get("pages", {})
    candidates=[]
    for page in pages.values():
        info=(page.get("imageinfo") or [{}])[0]
        url=info.get("thumburl") or info.get("url")
        mime=info.get("mime", "")
        if not url or not mime.startswith("image/") or mime == "image/svg+xml":
            continue
        title_tokens=tokens(page.get("title", ""))
        overlap=len(name_tokens & title_tokens)
        locality_overlap=len(locality_tokens & title_tokens)
        destination_overlap=len(destination_tokens & title_tokens)
        score=overlap*3 + locality_overlap*1.5 + destination_overlap*0.5
        # Exact landmark token overlap is required to avoid unrelated destination photos.
        if overlap:
            candidates.append((score, url, page.get("title", "")))
    candidates.sort(reverse=True)
    return candidates[0] if candidates and candidates[0][0] >= 3 else None

def main():
    places=json.loads(DATA_FILE.read_text(encoding="utf-8"))
    IMAGE_DIR.mkdir(parents=True, exist_ok=True)
    updated=0; unresolved=[]
    with SessionLocal() as db:
        for place in places:
            row=db.query(Experience).filter(Experience.name == place["name"], Experience.destination == place["destination"]).first()
            if row is None:
                unresolved.append((place["name"], "database record not found")); continue
            try:
                match=search_image(place)
                if not match:
                    unresolved.append((place["name"], "no sufficiently relevant Wikimedia Commons image match")); continue
                score,url,title=match
                image=requests.get(url, headers=HEADERS, timeout=35)
                image.raise_for_status()
                content_type=image.headers.get("content-type", "")
                if not content_type.startswith("image/"):
                    unresolved.append((place["name"], "Commons returned non-image content")); continue
                ext=".jpg" if "jpeg" in content_type or "jpg" in content_type else ".png" if "png" in content_type else ".webp" if "webp" in content_type else ".img"
                filename=f"{row.experience_id}-{slug(row.name)}{ext}"
                (IMAGE_DIR / filename).write_bytes(image.content)
                local_url=f"/static/images/places/{filename}"
                row.image_url=local_url
                row.gallery_json=json.dumps([local_url], ensure_ascii=False)
                # Keep rating/count derived only from actual Explorely reviews, never scraped/invented values.
                actual=db.query(Review).filter(Review.experience_id == row.experience_id).all()
                if actual:
                    row.rating=round(sum(int(r.rating) for r in actual)/len(actual), 1)
                    row.review_count=len(actual)
                else:
                    row.rating=0.0
                    row.review_count=0
                updated += 1
                print(f"UPDATED: {row.name} <- {title}")
                time.sleep(0.15)
            except Exception as exc:
                unresolved.append((place["name"], str(exc)))
        # Reconcile ratings for every listing against actual Explorely-submitted reviews.
        # This clears old placeholder star scores/review counts that have no review rows.
        for experience in db.query(Experience).all():
            actual = db.query(Review).filter(Review.experience_id == experience.experience_id).all()
            if actual:
                experience.rating = round(sum(int(review.rating) for review in actual) / len(actual), 1)
                experience.review_count = len(actual)
            else:
                experience.rating = 0.0
                experience.review_count = 0
        db.commit()
    print(f"\nUpdated images: {updated}/{len(places)}")
    print("All catalogue ratings/counts now reflect only actual Explorely-submitted reviews; unreviewed places remain unrated.")
    if unresolved:
        print("\nNeeds manual image/review verification:")
        for name, reason in unresolved:
            print(f"- {name}: {reason}")

if __name__ == "__main__":
    main()
