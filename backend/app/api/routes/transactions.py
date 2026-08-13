"""
Elfaidy Coin - Transaction Routes
POST /api/transactions, GET /api/transactions, GET /api/transactions/pending, GET /api/transactions/{id}
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import schemas
from app.dependencies import get_current_active_user
from app.services.transaction_service import (
    create_transfer_transaction,
    get_user_transactions,
    get_pending_transactions,
    verify_transaction
)

router = APIRouter(tags=["Transactions"])

@router.post("", response_model=schemas.TransactionResponse, status_code=201)
def create_transaction(
    tx_data: schemas.TransactionCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user)
):
    """Create a new signed transfer transaction."""
    return create_transfer_transaction(db, current_user, tx_data)

@router.get("", response_model=List[schemas.TransactionResponse])
def list_my_transactions(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user)
):
    """List all transactions involving the current user."""
    return get_user_transactions(db, current_user.id)

@router.get("/pending", response_model=List[schemas.TransactionResponse])
def list_pending_transactions(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user)
):
    """List all pending transactions (mining pool)."""
    return get_pending_transactions(db)

@router.get("/{transaction_id}", response_model=schemas.TransactionDetailResponse)
def get_transaction(
    transaction_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user)
):
    """Get transaction details with signature verification."""
    from app import models
    tx = db.query(models.Transaction).filter(
        models.Transaction.transaction_id == transaction_id
    ).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    result = verify_transaction(db, transaction_id)

    return schemas.TransactionDetailResponse(
        id=tx.id,
        transaction_id=tx.transaction_id,
        sender_address=tx.sender_address,
        receiver_address=tx.receiver_address,
        amount=tx.amount,
        timestamp=tx.timestamp,
        transaction_type=schemas.TransactionTypeEnum(tx.transaction_type.value),
        status=schemas.TransactionStatusEnum(tx.status.value),
        block_index=tx.block_index,
        signature=tx.signature,
        signature_valid=result.get("signature_valid")
    )
