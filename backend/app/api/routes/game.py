"""
Elfaidy Coin - Game Routes
POST /api/game/start, POST /api/game/complete, GET /api/game/history
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import schemas
from app.dependencies import get_current_active_user
from app.services.game_service import start_game_session, complete_game_session, get_game_history

router = APIRouter(tags=["Game"])

@router.post("/start", response_model=schemas.GameStartResponse)
def start_game(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user)
):
    """Start a new game session with server-side tracking."""
    return start_game_session(db, current_user)

@router.post("/complete", response_model=schemas.GameCompleteResponse)
def complete_game(
    completion: schemas.GameCompleteRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user)
):
    """Complete a game session and receive validated reward."""
    return complete_game_session(db, current_user, completion)

@router.get("/history", response_model=List[schemas.GameHistoryResponse])
def game_history(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user)
):
    """Get game history for the current user."""
    return get_game_history(db, current_user.id)
