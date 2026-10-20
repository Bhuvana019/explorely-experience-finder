# Explorely — Experience Finder (Project 2)

> **"Discover places. Find experiences. Travel better."**

Explorely is a modern, lightweight travel discovery web application built for curated Indian destinations (Goa, Jaipur, Chennai, Bangalore, Delhi, Manali, Mumbai).

The application is engineered with a **dual-architecture capability**:
1. **Standalone Zero-Dependency Web Project**: Can run directly in any web browser without needing a backend server, using client-side localStorage and a rich seeded catalog of authentic Indian travel experiences.
2. **Full-Stack REST Application**: Powered by a robust **FastAPI** backend with SQLite/PostgreSQL, SQLAlchemy ORM, and OpenAPI/Swagger documentation, specifically designed for seamless REST API consumption by **Project 1 (Smart Travel Planner)**.

---

## 🎨 Visual Design System

Conforming to the Explorely Design Specification:
- **Movement**: Modern Architectural Minimalism with Tactile Soft Surfaces.
- **Palette**:
  - `Primary`: Deep Emerald Teal (`#0D9488` / `#00685f`)
  - `Secondary`: Amber Saffron (`#F59E0B` / `#855300`)
  - `Surface Canvas`: Warm Sand Foundation (`#FAF8F5`)
  - `Card Surface`: Crisp Pure White (`#FFFFFF`) with 1px hairline border & ambient shadows
- **Typography**: Plus Jakarta Sans (`400`, `500`, `600`, `700`, `800`).
- **Layout & Elevation**: Responsive 12-column grid (`1280px` max-width), Level 1 card elevation, Level 2 hover lift (`translateY(-2px)`), Level 3 modal backdrop blur.

---

## 🚀 Quick Start Guide

### Option 1: Run as an Individual Standalone Project (Zero Setup)
Simply open any of the HTML files directly in your web browser:
```bash
# Double-click or open directly in your browser:
index.html
```
Or start a simple static web server:
```bash
python -m http.server 3000
# Visit: http://localhost:3000
```
*In Standalone mode, all features (searching, multi-attribute filtering, details viewing, writing reviews, saving items, exporting wishlists, and user profile management) work entirely within the browser via `localStorage`.*

---

### Option 2: Run with FastAPI Backend & Live REST APIs
1. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Launch the FastAPI application**:
   ```bash
   python run.py
   # Or via Uvicorn:
   uvicorn app.main:app --reload --port 8000
   ```

3. **Access points**:
   - **Frontend Web UI**: [http://127.0.0.1:8000](http://127.0.0.1:8000)
   - **Interactive Swagger Documentation**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
   - **ReDoc API Reference**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)
   - **Project 1 Integration Bridge**: [http://127.0.0.1:8000/api/sync/export](http://127.0.0.1:8000/api/sync/export)

---

## 🔄 Dual Mode Switcher
Explorely includes a built-in **Mode Switcher** widget in the top navigation header:
- **🟢 Live REST API Mode**: Actively communicates with the FastAPI backend over HTTP/REST.
- **🔵 Standalone Mode**: Employs client-side storage with zero network dependencies.
- Clicking the mode indicator pill opens an inspector modal with a **Live API Ping Tester**, Base URL configuration, and instant mode toggling.

---

## 📡 REST API Endpoints Specification

Explorely exposes clean, structured REST endpoints adhering to the Project 2 specification:

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status check |
| `GET` | `/api/experiences` | List experiences (supports `destination`, `category`, `min_rating`, `max_price`, `search`) |
| `GET` | `/api/experiences/{id}` | Detailed experience payload with highlights, gallery, and itinerary |
| `GET` | `/api/restaurants` | List restaurants (supports `destination`, `cuisine`) |
| `GET` | `/api/restaurants/{id}` | Detailed restaurant profile with signature dishes |
| `GET` | `/api/experiences/{id}/reviews` | Fetch reviews for a specific experience |
| `POST` | `/api/reviews` | Submit a traveler review (recalculates average score) |
| `GET` | `/api/saved/experiences` | Fetch user's bookmarked experiences |
| `POST` | `/api/saved/experiences` | Add experience to user's saved vault |
| `DELETE` | `/api/saved/experiences/{id}` | Remove experience from saved vault |
| `GET` | `/api/saved/restaurants` | Fetch user's bookmarked restaurants |
| `POST` | `/api/saved/restaurants` | Add restaurant to saved vault |
| `DELETE` | `/api/saved/restaurants/{id}` | Remove restaurant from saved vault |
| `GET` | `/api/sync/export` | **Project 1 Bridge**: Full structured JSON export for Smart Travel Planner |

---

## 📁 Project Directory Structure

```
c:\Users\neeth\Downloads\EXPLORER\
├── index.html                  # Home Page (Hero search, Popular Destinations, Categories)
├── explore.html                # Explore/Results Page (Sidebar filters, sorting, cards grid)
├── experience-detail.html      # Experience Details (Gallery, specs, itinerary, reviews)
├── restaurant-detail.html      # Restaurant Details (Cuisine, hours, signature dishes)
├── saved.html                  # Saved Vault (4 metric cards, tabs, Project 1 bridge panel)
├── login.html                  # Login Page (Show/hide password, demo credentials)
├── register.html               # Registration Page
├── profile.html                # User Profile Page (Saved count, review stats, profile edit)
├── css/
│   └── style.css               # Core Design System (Tokens, Plus Jakarta Sans, responsiveness)
├── js/
│   ├── api.js                  # Unified API Client (Dual-mode: REST & LocalStorage)
│   ├── main.js                 # Header, modal switcher, toast notifications, search
│   ├── explore.js              # Live filtering, sorting, pagination, skeletons
│   ├── details.js              # Gallery collage, booking calculator, review submit
│   ├── saved.js                # Metrics calculation, tabs, JSON export modal
│   └── auth.js                 # Authentication & profile management
├── app/                        # FastAPI Full-Stack Backend
│   ├── main.py                 # FastAPI application, CORS, and template views
│   ├── database.py             # SQLAlchemy configuration (SQLite / PostgreSQL)
│   ├── models.py               # ORM entities (Users, Experiences, Restaurants, Reviews, Saved)
│   ├── schemas.py              # Pydantic validation schemas
│   ├── seed_data.py            # Pre-seeded Indian travel catalog
│   ├── routers/                # REST Routers (experiences, restaurants, reviews, saved, users)
│   ├── templates/              # Jinja2 templates (identical UI parity)
│   └── static/                 # Static assets (css, js)
├── run.py                      # One-line server runner
├── requirements.txt            # Python dependencies
├── .env                        # Environment variables
└── README.md                   # Complete documentation
```

---

## 🤝 Project 1 (Smart Travel Planner) Integration Contract

When Project 1 consumes Explorely's API:
```bash
# Example Request from Project 1:
GET http://localhost:8000/api/experiences?destination=Goa&category=Adventure
```
Response:
```json
[
  {
    "experience_id": 1,
    "name": "Grand Island Scuba Diving & Dolphin Safari Combo",
    "destination": "Goa",
    "locality": "Grand Island, South Goa",
    "category": "Adventure",
    "description": "Dive into the crystalline waters of Grand Island...",
    "price": 2499,
    "rating": 4.9,
    "review_count": 340,
    "duration": "6 Hours",
    "image_url": "https://images.unsplash.com/..."
  }
]
```
The **Saved Experiences & Places** screen also features a dedicated **"Export List (JSON)"** and **"Live JSON Payload format"** modal enabling one-click download and clipboard copying of the payload contract expected by Project 1.
