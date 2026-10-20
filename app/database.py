import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DEFAULT_DB_FILE = BASE_DIR / "explorely.db"

db_env = os.getenv("EXPLORELY_DATABASE_URL") or os.getenv("EXPLORER_DATABASE_URL")
if not db_env:
    candidate = os.getenv("DATABASE_URL", "")
    if candidate and "travel_planner" not in candidate:
        db_env = candidate

DATABASE_URL = db_env or f"sqlite:///{DEFAULT_DB_FILE.as_posix()}"

# SQLite connection arguments
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
