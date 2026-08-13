"""
Elfaidy Coin - Faucet Service
Educational faucet for controlled EFC distribution with cooldown.
"""
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException
from app import models, schemas
from app.services.wallet_service import get_wallet_by_user
from app.config import get_settings

settings = get_settings()

def get_faucet_status(db: Session, user: models.User) -> schemas.FaucetStatus:
    """Check if user can claim from the faucet."""
    last_claim = db.query(models.FaucetClaim).filter(
        models.FaucetClaim.user_id == user.id
    ).order_by(models.FaucetClaim.claimed_at.desc()).first()

    can_claim = True
    next_available = None

    if last_claim:
        cooldown_end = last_claim.claimed_at + timedelta(hours=settings.FAUCET_COOLDOWN_HOURS)
        if datetime.utcnow() < cooldown_end:
            can_claim = False
            next_available = cooldown_end

    return schemas.FaucetStatus(
        can_claim=can_claim,
        last_claimed=last_claim.claimed_at if last_claim else None,
        next_claim_available=next_available,
        reward_amount=settings.FAUCET_REWARD,
        cooldown_hours=settings.FAUCET_COOLDOWN_HOURS
    )

def claim_faucet(db: Session, user: models.User) -> schemas.FaucetClaimResponse:
    """Claim EFC from the educational faucet."""
    status = get_faucet_status(db, user)

    if not status.can_claim:
        raise HTTPException(
            status_code=400,
            detail=f"Faucet cooldown active. Next claim available at {status.next_claim_available}"
        )

    wallet = get_wallet_by_user(db, user.id)
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")

    # Create faucet claim record
    claim = models.FaucetClaim(
        user_id=user.id,
        amount=settings.FAUCET_REWARD
    )
    db.add(claim)
    db.flush()  # Get the ID before creating transaction

    # Create reward transaction
    tx = models.Transaction(
        transaction_id=f"faucet_{claim.id}_{datetime.utcnow().timestamp()}",
        sender_address=None,
        receiver_address=wallet.address,
        amount=settings.FAUCET_REWARD,
        transaction_type=models.TransactionType.FAUCET_REWARD,
        status=models.TransactionStatus.CONFIRMED,
        signature=None
    )
    db.add(tx)
    db.commit()

    return schemas.FaucetClaimResponse(
        success=True,
        amount=settings.FAUCET_REWARD,
        transaction_id=tx.transaction_id,
        message=f"Successfully claimed {settings.FAUCET_REWARD} EFC from the educational faucet"
    )
