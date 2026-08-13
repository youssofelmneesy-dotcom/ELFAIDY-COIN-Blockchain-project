"""
Elfaidy Coin - Wallet Service
Manages wallet creation, balance calculation, and lookups.
"""
from sqlalchemy.orm import Session
from sqlalchemy import func
from app import models, schemas
from app.core.crypto.wallet import create_wallet

def create_wallet_for_user(db: Session, user_id: int) -> models.Wallet:
    """Create a new cryptographic wallet for a user."""
    wallet_data = create_wallet()
    wallet = models.Wallet(
        user_id=user_id,
        address=wallet_data["address"],
        public_key=wallet_data["public_key"],
        private_key=wallet_data["private_key"]
    )
    db.add(wallet)
    db.commit()
    db.refresh(wallet)
    return wallet

def get_wallet_by_user(db: Session, user_id: int) -> models.Wallet:
    """Get a user's wallet."""
    return db.query(models.Wallet).filter(models.Wallet.user_id == user_id).first()

def get_wallet_by_address(db: Session, address: str) -> models.Wallet:
    """Get wallet by address."""
    return db.query(models.Wallet).filter(models.Wallet.address == address).first()

def calculate_balance(db: Session, address: str) -> schemas.WalletBalance:
    """
    Calculate confirmed, pending outgoing, and available balance.

    Confirmed Balance = sum of all confirmed incoming - sum of all confirmed outgoing
    Pending Outgoing = sum of all pending outgoing transactions
    Available = Confirmed - Pending Outgoing
    """
    # Confirmed incoming
    confirmed_in = db.query(func.coalesce(func.sum(models.Transaction.amount), 0.0)).filter(
        models.Transaction.receiver_address == address,
        models.Transaction.status == models.TransactionStatus.CONFIRMED
    ).scalar() or 0.0

    # Confirmed outgoing
    confirmed_out = db.query(func.coalesce(func.sum(models.Transaction.amount), 0.0)).filter(
        models.Transaction.sender_address == address,
        models.Transaction.status == models.TransactionStatus.CONFIRMED
    ).scalar() or 0.0

    confirmed_balance = confirmed_in - confirmed_out

    # Pending outgoing (double-spending protection)
    pending_out = db.query(func.coalesce(func.sum(models.Transaction.amount), 0.0)).filter(
        models.Transaction.sender_address == address,
        models.Transaction.status == models.TransactionStatus.PENDING
    ).scalar() or 0.0

    available_balance = confirmed_balance - pending_out

    return schemas.WalletBalance(
        address=address,
        confirmed_balance=confirmed_balance,
        pending_outgoing=pending_out,
        available_balance=available_balance
    )

def search_users_by_username(db: Session, query: str) -> list:
    """Search users by username prefix for recipient lookup."""
    users = db.query(models.User).filter(
        models.User.username.ilike(f"%{query}%")
    ).limit(10).all()

    results = []
    for user in users:
        wallet = get_wallet_by_user(db, user.id)
        if wallet:
            results.append(schemas.UserSearchResult(
                id=user.id,
                username=user.username,
                wallet_address=wallet.address
            ))
    return results
