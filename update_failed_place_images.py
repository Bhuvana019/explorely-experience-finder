
import json
import requests

from app.database import SessionLocal
from app.models import Experience

# Paste plain direct image URLs here — no Markdown [text](url) formatting.
CANDIDATES = {
    "Bekal Fort and Beach": "https://images.unsplash.com/photo-1698070010241-1ac4d4273dff?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",

    "Mahabalipuram Beach": "https://images.unsplash.com/photo-1708637570263-2a630ffa485e?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",

    "Marari Beach": "https://plus.unsplash.com/premium_photo-1669359806362-6bd0218a4fd2?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",

    "Paradise Beach": "https://images.unsplash.com/photo-1621583628955-42fbc37bf424?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",

    "RK Beach and Submarine Museum": "https://images.unsplash.com/photo-1770786998726-8ebbac5fa420?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",

    "Manakula Vinayagar Temple": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRXU9ug6mmTtvJnCwXTzSX8No50kCjbyVdBKcZ0uv5Ldsf0sFCYKaFcWhws&s=10",

    "Meenakshi Amman Temple Visit":"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJLDJSfbLDHIWApfXMZT9jQgxdo1J8M5k9WEUKWzY3Bg&s=10",

    "Brihadeeswarar Temple Visit":"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnFjlLnKXZ4r581y1frZkYhaUcax2vmWNFSRxb8vXuLQ&s=10",

    "Rameswaram Ramanathaswamy Temple":"https://www.daiwikhotels.com/wp-content/uploads/2024/07/newone.jpg",

    "Dhanushkodi Ruins and Coast":"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQTCJGy7kFWDMkO2aKZk0qLkkN54C9Qat-clFZjp0e6gcv8reETNYgG6CQ&s=10",

    "Alappuzha Backwater Cruise":"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSPRN--Ky11tSb5bDj9f7nH84meIr1IXrHzq3RG9cxcSA&s=10",

    "Virupaksha Temple Visit":"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT_G1iokHQcVCiIIADwILnE8HVhwCZl3dVbq6VY0gjL4b_9X3JJL-fYUJkT&s=10",

    "Mysore Palace Visit":"https://www.karthitravels.com/images/destinations/mysore.jpg",

    "Hampi UNESCO Ruins Trail":"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRU7S-PT_velmzz38Cx-PR5aRwpkh5dhuCbZ4CMEWJvIg&s=10",

    "Ajanta Caves Guided Visit":"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS1VGKltGzp7momc-YFk6EDlRDwoq6Ok08vytGq0_AumlNTyAktQatK09E&s=10"
}

USER_AGENT = "ExplorelyImageVerifier/1.0"


def verify_image_url(url):
    if not url.startswith("https://"):
        return False, "URL must use HTTPS"

    try:
        response = requests.get(
            url,
            headers={"User-Agent": USER_AGENT},
            timeout=(5, 15),
            stream=True,
            allow_redirects=True,
        )

        try:
            content_type = response.headers.get("Content-Type", "").lower()

            if response.status_code != 200:
                return False, f"HTTP {response.status_code}"

            if not content_type.startswith("image/"):
                return False, f"Not an image response: {content_type}"

            if "svg" in content_type:
                return False, "SVG is not accepted"

            return True, "OK"
        finally:
            response.close()

    except requests.RequestException as exc:
        return False, str(exc)


def main():
    verified = {}

    print("\nChecking supplied image URLs...\n")

    for name, url in CANDIDATES.items():
        ok, reason = verify_image_url(url)

        if ok:
            verified[name] = url
            print(f"VERIFIED: {name}")
        else:
            print(f"SKIPPED: {name} — {reason}")

    if not verified:
        print("\nNo verified URLs. Database unchanged.")
        return

    db = SessionLocal()

    try:
        updates = {}

        # Validate all records before modifying any of them.
        for name, url in verified.items():
            matches = (
                db.query(Experience)
                .filter(Experience.name == name)
                .all()
            )

            if len(matches) != 1:
                raise RuntimeError(
                    f"Expected exactly one record for {name!r}; "
                    f"found {len(matches)}. No changes committed."
                )

            record = matches[0]

            if not hasattr(record, "gallery_json"):
                raise RuntimeError(
                    "Experience model has no gallery_json attribute. "
                    "No changes committed."
                )

            updates[name] = (record, url)

        print("\nReady to update these fields:")
        print("  image_url")
        print("  gallery_json")

        for name, (_, url) in updates.items():
            print(f"\n{name}\n  {url}")

        print(
            "\nEach supplied URL will become the cover image and "
            "the single gallery image for that record."
        )
        print(
            "This does not verify that the photo depicts the named place."
        )

        confirm = input(
            "\nVisually verify the photos, then type YES to continue: "
        ).strip()

        if confirm != "YES":
            print("Cancelled. Database unchanged.")
            return

        for name, (record, url) in updates.items():
            record.image_url = url
            record.gallery_json = json.dumps([url])

        db.commit()
        print(f"\nSUCCESS: Updated both image fields for {len(updates)} places.")

    except Exception as exc:
        db.rollback()
        print(f"\nERROR: {exc}")
        print("Changes rolled back.")
        raise

    finally:
        db.close()


if __name__ == "__main__":
    main()
