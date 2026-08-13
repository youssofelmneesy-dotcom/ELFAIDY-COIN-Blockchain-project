"""
Elfaidy Coin - Transaction Service
Handles creation, validation, signing, and lifecycle of transactions.
"""
from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app import models, schemas
from app.core.blockchain.transaction import (
    generate_transaction_id,
    create_transaction_payload,
    sign_transaction,
    verify_transaction_signature
)
from app.services.wallet_service import get_wallet_by_user, get_wallet_by_address, calculate_balance

def create_transfer_transaction(
    db: Session,
    sender_user: models.User,
    tx_data: schemas.TransactionCreate
) -> models.Transaction:
    """
    Create a signed transfer transaction with full validation.

    Validation includes:
    - Recipient exists
    - Amount is positive
    - Sufficient available balance (including pending outgoing)
    - Digital signature creation
    """
    sender_wallet = get_wallet_by_user(db, sender_user.id)
    if not sender_wallet:
        raise HTTPException(status_code=404, detail="Sender wallet not found")

    # Resolve recipient
    receiver_address = tx_data.receiver_address
    if tx_data.receiver_username:
        recipient = db.query(models.User).filter(
            models.User.username == tx_data.receiver_username
        ).first()
        if not recipient:
            raise HTTPException(status_code=404, detail="Recipient username not found")
        recipient_wallet = get_wallet_by_user(db, recipient.id)
        if not recipient_wallet:
            raise HTTPException(status_code=404, detail="Recipient wallet not found")
        receiver_address = recipient_wallet.address

    if not receiver_address:
        raise HTTPException(status_code=400, detail="Recipient address or username required")

    if receiver_address == sender_wallet.address:
        raise HTTPException(status_code=400, detail="Cannot send to yourself")

    # Validate amount
    if tx_data.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")

    # Check available balance (confirmed - pending outgoing)
    balance = calculate_balance(db, sender_wallet.address)
    if balance.available_balance < tx_data.amount:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient balance. Available: {balance.available_balance:.2f} EFC, Requested: {tx_data.amount:.2f} EFC"
        )

    # Create and sign transaction
    tx_id = generate_transaction_id()
    timestamp = datetime.utcnow()
    payload = create_transaction_payload(
        sender_address=sender_wallet.address,
        receiver_address=receiver_address,
        amount=tx_data.amount,
        timestamp=timestamp
    )
    signature = sign_transaction(sender_wallet.private_key, payload)

    transaction = models.Transaction(
        transaction_id=tx_id,
        sender_address=sender_wallet.address,
        receiver_address=receiver_address,
        amount=tx_data.amount,
        timestamp=timestamp,
        signature=signature,
        transaction_type=models.TransactionType.TRANSFER,
        status=models.TransactionStatus.PENDING
    )

    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    return transaction

def get_user_transactions(db: Session, user_id: int) -> list:
    """Get all transactions involving a user's wallet."""
    wallet = get_wallet_by_user(db, user_id)
    if not wallet:
        return []

    txs = db.query(models.Transaction).filter(
        (models.Transaction.sender_address == wallet.address) |
        (models.Transaction.receiver_address == wallet.address)
    ).order_by(models.Transaction.timestamp.desc()).all()

    return txs

def get_pending_transactions(db: Session) -> list:
    """Get all pending transactions waiting to be mined."""
    return db.query(models.Transaction).filter(
        models.Transaction.status == models.TransactionStatus.PENDING
    ).all()

def verify_transaction(db: Session, transaction_id: str) -> dict:
    """Verify a transaction's digital signature."""
    tx = db.query(models.Transaction).filter(
        models.Transaction.transaction_id == transaction_id
    ).first()

    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    if tx.transaction_type in [models.TransactionType.GENESIS, models.TransactionType.MINING_REWARD,
                                models.TransactionType.GAME_REWARD, models.TransactionType.FAUCET_REWARD]:
        return {"transaction_id": tx.transaction_id, "signature_valid": None, "message": "System transactions do not require signatures"}

    sender_wallet = get_wallet_by_address(db, tx.sender_address)
    if not sender_wallet:
        return {"transaction_id": tx.transaction_id, "signature_valid": False, "message": "Sender wallet not found"}

    payload = create_transaction_payload(
        sender_address=tx.sender_address,
        receiver_address=tx.receiver_address,
        amount=tx.amount,
        timestamp=tx.timestamp
    )

    is_valid = verify_transaction_signature(sender_wallet.public_key, payload, tx.signature)
    return {
        "transaction_id": tx.transaction_id,
        "signature_valid": is_valid,
        "message": "Signature is valid" if is_valid else "Signature is INVALID - transaction may have been tampered"
    }
