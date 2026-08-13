"""
Elfaidy Coin - Mining Routes
POST /api/mining/mine - Mine pending transactions into a new block.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import schemas
from app.dependencies import get_current_active_user
from app.services.mining_service import mine_pending_transactions

router = APIRouter(tags=["Mining"])

@router.post("/mine", response_model=schemas.MineResponse)
def mine(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user)
):
    """Mine all pending transactions and create a new block."""
    return mine_pending_transactions(db, current_user)
