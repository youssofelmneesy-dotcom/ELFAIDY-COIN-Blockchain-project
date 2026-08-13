"""
Elfaidy Coin - Statistics Service
Aggregates platform-wide statistics for the dashboard and stats page.
"""
from sqlalchemy.orm import Session
from sqlalchemy import func
from app import models
from app.config import get_settings

settings = get_settings()

def get_statistics(db: Session) -> dict:
    """Calculate and return all platform statistics."""
    total_users = db.query(func.count(models.User.id)).scalar() or 0
    total_wallets = db.query(func.count(models.Wallet.id)).scalar() or 0
    total_blocks = db.query(func.count(models.Block.index)).scalar() or 0
    total_transactions = db.query(func.count(models.Transaction.id)).scalar() or 0

    total_transfers = db.query(func.count(models.Transaction.id)).filter(
        models.Transaction.transaction_type == models.TransactionType.TRANSFER
    ).scalar() or 0

    total_mining_rewards = db.query(func.coalesce(func.sum(models.Transaction.amount), 0.0)).filter(
        models.Transaction.transaction_type == models.TransactionType.MINING_REWARD
    ).scalar() or 0.0

    total_game_rewards = db.query(func.coalesce(func.sum(models.Transaction.amount), 0.0)).filter(
        models.Transaction.transaction_type == models.TransactionType.GAME_REWARD
    ).scalar() or 0.0

    total_faucet_rewards = db.query(func.coalesce(func.sum(models.Transaction.amount), 0.0)).filter(
        models.Transaction.transaction_type == models.TransactionType.FAUCET_REWARD
    ).scalar() or 0.0

    total_transfer_volume = db.query(func.coalesce(func.sum(models.Transaction.amount), 0.0)).filter(
        models.Transaction.transaction_type == models.TransactionType.TRANSFER
    ).scalar() or 0.0

    efc_circulation = db.query(func.coalesce(func.sum(models.Transaction.amount), 0.0)).filter(
        models.Transaction.status == models.TransactionStatus.CONFIRMED
    ).scalar() or 0.0

    pending_transactions = db.query(func.count(models.Transaction.id)).filter(
        models.Transaction.status == models.TransactionStatus.PENDING
    ).scalar() or 0

    return {
        "total_users": total_users,
        "total_wallets": total_wallets,
        "total_blocks": total_blocks,
        "total_transactions": total_transactions,
        "total_transfers": total_transfers,
        "total_mining_rewards": total_mining_rewards,
        "total_game_rewards": total_game_rewards,
        "total_faucet_rewards": total_faucet_rewards,
        "total_transfer_volume": total_transfer_volume,
        "efc_circulation": efc_circulation,
        "pending_transactions": pending_transactions,
        "difficulty": settings.DIFFICULTY,
        "mining_reward": settings.MINING_REWARD
    }
