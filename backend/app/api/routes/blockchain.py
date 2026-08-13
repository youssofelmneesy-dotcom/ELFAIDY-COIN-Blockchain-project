"""
Elfaidy Coin - Blockchain Routes
GET /api/blockchain, GET /api/blockchain/validate, GET /api/blocks/{index}, POST /api/blockchain/tamper
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
from app.database import get_db
from app import models, schemas
from app.dependencies import get_current_active_user
from app.services.blockchain_service import (
    get_blockchain,
    get_all_blocks,
    get_block_by_index,
    validate_blockchain,
    simulate_tampering,
    initialize_blockchain_from_db
)
from app.services.statistics_service import get_statistics

router = APIRouter(prefix="/blockchain", tags=["Blockchain"])

@router.get("", response_model=schemas.BlockchainStatus)
def get_blockchain_status(db: Session = Depends(get_db)):
    """Get overall blockchain status."""
    bc = get_blockchain()
    stats = get_statistics(db)
    return schemas.BlockchainStatus(
        total_blocks=len(bc.chain),
        total_transactions=stats["total_transactions"],
        is_valid=bc.is_valid(),
        genesis_block_hash=bc.chain[0].hash if bc.chain else "",
        latest_block_hash=bc.chain[-1].hash if bc.chain else ""
    )

@router.get("/validate", response_model=schemas.ValidationResult)
def validate_chain(db: Session = Depends(get_db)):
    """Validate the entire blockchain integrity."""
    return validate_blockchain(db)

@router.get("/blocks", response_model=List[schemas.BlockResponse])
def list_blocks(db: Session = Depends(get_db)):
    """List all blocks in the blockchain."""
    db_blocks = db.query(models.Block).options(joinedload(models.Block.transactions)).order_by(models.Block.index).all()
    result = []
    for b in db_blocks:
        txs = []
        for tx in b.transactions:
            txs.append(schemas.TransactionResponse(
                id=tx.id,
                transaction_id=tx.transaction_id,
                sender_address=tx.sender_address,
                receiver_address=tx.receiver_address,
                amount=tx.amount,
                timestamp=tx.timestamp,
                transaction_type=schemas.TransactionTypeEnum(tx.transaction_type.value),
                status=schemas.TransactionStatusEnum(tx.status.value),
                block_index=tx.block_index
            ))
        result.append(schemas.BlockResponse(
            index=b.index,
            timestamp=b.timestamp,
            previous_hash=b.previous_hash,
            nonce=b.nonce,
            difficulty=b.difficulty,
            hash=b.hash,
            miner_address=b.miner_address,
            transaction_count=len(txs),
            transactions=txs
        ))
    return result

@router.get("/blocks/{index}", response_model=schemas.BlockResponse)
def get_block(index: int, db: Session = Depends(get_db)):
    """Get a specific block by index."""
    block = db.query(models.Block).options(joinedload(models.Block.transactions)).filter(models.Block.index == index).first()
    if not block:
        raise HTTPException(status_code=404, detail="Block not found")

    txs = []
    for tx in block.transactions:
        txs.append(schemas.TransactionResponse(
            id=tx.id,
            transaction_id=tx.transaction_id,
            sender_address=tx.sender_address,
            receiver_address=tx.receiver_address,
            amount=tx.amount,
            timestamp=tx.timestamp,
            transaction_type=schemas.TransactionTypeEnum(tx.transaction_type.value),
            status=schemas.TransactionStatusEnum(tx.status.value),
            block_index=tx.block_index
        ))

    return schemas.BlockResponse(
        index=block.index,
        timestamp=block.timestamp,
        previous_hash=block.previous_hash,
        nonce=block.nonce,
        difficulty=block.difficulty,
        hash=block.hash,
        miner_address=block.miner_address,
        transaction_count=len(txs),
        transactions=txs
    )

@router.post("/tamper", response_model=schemas.TamperResponse)
def tamper_blockchain(
    request: schemas.TamperRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user)
):
    """Simulate blockchain tampering for educational security demo."""
    try:
        result = simulate_tampering(db, request.block_index, request.new_amount)
        return schemas.TamperResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
