
import os

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse

from app.database import engine, Base, SessionLocal
from app.seed_data import seed_database
from app.routers import experiences, restaurants, reviews, saved, users


# --------------------------------------------------
# Initialize database schema and seed data
# --------------------------------------------------

Base.metadata.create_all(bind=engine)

with SessionLocal() as db_session:
    seed_database(db_session)

# Ensure full catalogue is loaded even on fresh deployments (like Render)
try:
    import setup_south_india_catalogue
    setup_south_india_catalogue.main()
except Exception as e:
    print(f"[*] Note: South India catalogue initialization: {e}")

try:
    import add_additional_places
    add_additional_places.main()
except Exception as e:
    print(f"[*] Note: Additional places initialization: {e}")


# --------------------------------------------------
# Initialize FastAPI application
# --------------------------------------------------

app = FastAPI(
    title="Explorely API — Experience Finder (Project 2)",
    description="""
    ## Explorely Travel Discovery Engine

    A travel discovery platform focused on Indian destinations.

    Provides REST APIs for experiences, restaurants, reviews,
    and saved places, with guest access and potential integration
    into Smart Travel Planner (Project 1).
    """,
    version="1.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)


# --------------------------------------------------
# CORS configuration
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# Static assets
# --------------------------------------------------

app_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.dirname(app_dir)
static_dir = os.path.join(app_dir, "static")

if os.path.isdir(static_dir):
    app.mount(
        "/static",
        StaticFiles(directory=static_dir),
        name="static",
    )

for folder in ("css", "js", "images"):
    folder_path = os.path.join(root_dir, folder)

    if os.path.isdir(folder_path):
        app.mount(
            f"/{folder}",
            StaticFiles(directory=folder_path),
            name=folder,
        )


# --------------------------------------------------
# Jinja2 templates
# --------------------------------------------------

templates_dir = os.path.join(app_dir, "templates")
templates = Jinja2Templates(directory=templates_dir)


def render_page(request: Request, filename: str):
    return templates.TemplateResponse(
        request=request,
        name=filename,
        context={"request": request},
    )


# --------------------------------------------------
# Register travel API routers
# --------------------------------------------------

app.include_router(experiences.router)
app.include_router(experiences.integration_router)
app.include_router(restaurants.router)
app.include_router(reviews.router)
app.include_router(reviews.exp_reviews_router)
app.include_router(saved.router)
app.include_router(saved.sync_router)
app.include_router(users.router)


# --------------------------------------------------
# Health check
# --------------------------------------------------

@app.get("/api/health", tags=["System Health"])
@app.get("/health", tags=["System Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "Explorely Experience Finder (Project 2)",
        "version": "1.1.0",
        "api_docs": "/docs",
        "project1_sync_endpoint": "/api/sync/export",
    }


# --------------------------------------------------
# Frontend HTML routes
# --------------------------------------------------

@app.get("/", response_class=HTMLResponse, tags=["Frontend Views"])
@app.get("/index.html", response_class=HTMLResponse, tags=["Frontend Views"])
def view_index(request: Request):
    return render_page(request, "index.html")


@app.get("/explore", response_class=HTMLResponse, tags=["Frontend Views"])
@app.get("/explore.html", response_class=HTMLResponse, tags=["Frontend Views"])
def view_explore(request: Request):
    return render_page(request, "explore.html")


@app.get("/destinations", response_class=HTMLResponse, tags=["Frontend Views"])
@app.get("/destinations.html", response_class=HTMLResponse, tags=["Frontend Views"])
def view_destinations(request: Request):
    return render_page(request, "destinations.html")


@app.get("/categories", response_class=HTMLResponse, tags=["Frontend Views"])
@app.get("/categories.html", response_class=HTMLResponse, tags=["Frontend Views"])
def view_categories(request: Request):
    return render_page(request, "categories.html")


@app.get("/experience-detail.html", response_class=HTMLResponse, tags=["Frontend Views"])
def view_experience_detail(request: Request):
    return render_page(request, "experience-detail.html")


@app.get("/restaurant-detail.html", response_class=HTMLResponse, tags=["Frontend Views"])
def view_restaurant_detail(request: Request):
    return render_page(request, "restaurant-detail.html")


@app.get("/login.html", response_class=HTMLResponse, tags=["Frontend Views"])
@app.get("/login", response_class=HTMLResponse, tags=["Frontend Views"])
def view_login(request: Request):
    return render_page(request, "login.html")


@app.get("/signup.html", response_class=HTMLResponse, tags=["Frontend Views"])
@app.get("/signup", response_class=HTMLResponse, tags=["Frontend Views"])
@app.get("/register.html", response_class=HTMLResponse, tags=["Frontend Views"])
def view_signup(request: Request):
    return render_page(request, "signup.html")


@app.get("/saved", response_class=HTMLResponse, tags=["Frontend Views"])
@app.get("/saved.html", response_class=HTMLResponse, tags=["Frontend Views"])
def view_saved(request: Request):
    return render_page(request, "saved.html")


@app.get("/integration", response_class=HTMLResponse, tags=["Frontend Views"])
@app.get("/integration.html", response_class=HTMLResponse, tags=["Frontend Views"])
def view_integration(request: Request):
    return render_page(request, "integration.html")
