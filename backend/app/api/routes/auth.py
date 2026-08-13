"""
Elfaidy Coin - Authentication Routes
POST /api/auth/register, POST /api/auth/login, POST /api/auth/logout, GET /api/auth/me
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from app.database import get_db
from app import schemas
from app.dependencies import get_current_active_user
from app.services.auth_service import register_user, authenticate_user, create_access_token
from app.config import get_settings

settings = get_settings()
router = APIRouter(tags=["Authentication"])

@router.post("/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: schemas.UserRegister, db: Session = Depends(get_db)):
    """Register a new user account with automatic wallet creation."""
    return register_user(db, user_data)

@router.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Authenticate and receive a JWT access token."""
    user = authenticate_user(db, form_data.username, form_data.password)
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/logout")
def logout():
    """Logout (client-side token discard)."""
    return {"message": "Logout successful. Please discard your token."}

@router.get("/me", response_model=schemas.UserResponse)
def get_me(current_user=Depends(get_current_active_user)):
    """Get the currently authenticated user's profile."""
    return current_user
