"""
Authentication helpers for Explorely:
  - bcrypt password hashing
  - JWT access tokens
  - get_current_user FastAPI dependency
"""
import os
from datetime import datetime, timedelta, timezone
from typing import Optional

import bcrypt
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User

# --- Configuration -----------------------------------------------------------
# Set JWT_SECRET_KEY in the environment for any real deployment.
# The fallback is only for local college-project development.
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "explorely-dev-secret-change-me-please-0123456789")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))  # 24h

# bcrypt only uses the first 72 bytes of a password
MAX_PASSWORD_BYTES = 72

bearer_scheme = HTTPBearer(auto_error=False)


# --- Password hashing --------------------------------------------------------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    """Returns False (never raises) for wrong passwords or malformed/legacy hashes."""
    try:
        return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))
    except (ValueError, TypeError):
        return False


def is_bcrypt_hash(value: Optional[str]) -> bool:
    return bool(value) and value.startswith(("$2a$", "$2b$", "$2y$"))


# --- JWT ---------------------------------------------------------------------
def create_access_token(user_id: int) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user_id),
        "iat": now,
        "exp": now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def _credentials_error(detail: str = "Not authenticated") -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail,
        headers={"WWW-Authenticate": "Bearer"},
    )


# --- Dependency --------------------------------------------------------------
def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise _credentials_error("Not authenticated")

    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload.get("sub"))
    except jwt.ExpiredSignatureError:
        raise _credentials_error("Session expired. Please log in again.")
    except (jwt.InvalidTokenError, TypeError, ValueError):
        raise _credentials_error("Invalid authentication token")

    user = db.query(User).filter(User.user_id == user_id).first()
    if user is None:
        raise _credentials_error("User no longer exists")
    return user
