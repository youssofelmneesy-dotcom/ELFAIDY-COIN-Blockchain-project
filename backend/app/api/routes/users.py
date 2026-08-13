"""
Elfaidy Coin - User Routes
GET /api/users/search - Search users by username for recipient lookup.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import schemas
from app.dependencies import get_current_active_user
from app.services.wallet_service import search_users_by_username

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/search", response_model=List[schemas.UserSearchResult])
def search_users(
    q: str = Query(..., min_length=1, description="Username search query"),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user)
):
    """Search users by username to find wallet addresses for transfers."""
    return search_users_by_username(db, q)
