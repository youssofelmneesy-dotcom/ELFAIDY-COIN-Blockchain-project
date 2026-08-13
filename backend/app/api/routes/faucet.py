"""
Elfaidy Coin - Faucet Routes
GET /api/faucet/status, POST /api/faucet/claim
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import schemas
from app.dependencies import get_current_active_user
from app.services.faucet_service import get_faucet_status, claim_faucet

router = APIRouter(prefix="/faucet", tags=["Faucet"])

@router.get("/status", response_model=schemas.FaucetStatus)
def faucet_status(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user)
):
    """Check faucet claim status and cooldown."""
    return get_faucet_status(db, current_user)

@router.post("/claim", response_model=schemas.FaucetClaimResponse)
def claim(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user)
):
    """Claim EFC from the educational faucet."""
    return claim_faucet(db, current_user)
