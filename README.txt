# Explorely South India Catalogue Pack

Includes a curated starter catalogue of 100 South India listings (90 experiences/attractions and 10 restaurant discovery listings), an installer, an optional conservative Wikimedia Commons image matcher, and an API-filter patch note.

## Install
1. Back up your project folder and database.
2. Copy `south_india_places.json`, `setup_south_india_catalogue.py`, and `refresh_south_india_images.py` into `D:\EXPLORER\` (project root).
3. From that folder run: `python setup_south_india_catalogue.py`
4. To hide non-South-India experiences from the Explore API without deleting them, apply the instructions in `API_SOUTH_INDIA_FILTER_PATCH.txt` to `app/routers/experiences.py`. This keeps existing data safe.
5. Optional: run `python refresh_south_india_images.py` once. It spaces requests and backs off on HTTP 429. It may leave some generic images unchanged for manual review rather than assigning a wrong image.
6. Restart Uvicorn and hard refresh the browser (Ctrl+F5).

## Important data notes
- Destinations are city/area names because the current database schema has no separate state column; state is included in the JSON and address.
- New listings start with rating 0 and review_count 0. No Explorely reviews are fabricated.
- Prices are illustrative estimates only, not live ticket or menu prices. Check venues before visiting.
- The restaurant listings are separate records in the existing `restaurants` table; current app routes/UI must already expose restaurant data for them to appear in a restaurant section.
- The catalogue installer does not delete old records or user reviews/saved items.
