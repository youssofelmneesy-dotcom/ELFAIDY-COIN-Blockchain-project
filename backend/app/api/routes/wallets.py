"""
Elfaidy Coin - Wallet Routes
GET /api/wallets/me, GET /api/wallets/{address}, GET /api/wallets/{address}/balance
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import schemas
from app.dependencies import get_current_active_user
from app.services.wallet_service import get_wallet_by_user, get_wallet_by_address, calculate_balance

router = APIRouter(tags=["Wallets"])

@router.get("/me", response_model=schemas.WalletDetailResponse)
def get_my_wallet(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user)
):
    """Get the authenticated user's wallet with balance."""
    wallet = get_wallet_by_user(db, current_user.id)
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")

    balance = calculate_balance(db, wallet.address)
    tx_count = len(wallet.sent_transactions) + len(wallet.received_transactions)

    return schemas.WalletDetailResponse(
        id=wallet.id,
        user_id=wallet.user_id,
        address=wallet.address,
        public_key=wallet.public_key,
        created_at=wallet.created_at,
        balance=balance.confirmed_balance,
        transaction_count=tx_count
    )

@router.get("/{address}", response_model=schemas.WalletResponse)
def get_wallet(address: str, db: Session = Depends(get_db)):
    """Get wallet by address (public info only)."""
    wallet = get_wallet_by_address(db, address)
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")
    return wallet

@router.get("/{address}/balance", response_model=schemas.WalletBalance)
def get_wallet_balance(address: str, db: Session = Depends(get_db)):
    """Get detailed balance breakdown for a wallet."""
    wallet = get_wallet_by_address(db, address)
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")
    return calculate_balance(db, address)
