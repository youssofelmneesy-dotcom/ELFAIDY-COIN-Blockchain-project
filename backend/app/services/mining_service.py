"""
Elfaidy Coin - Mining Service
Orchestrates the mining process: gathers pending txs, mines block, updates state.
"""
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app import models, schemas
from app.core.blockchain.mining import MiningEngine
from app.services.blockchain_service import get_blockchain, save_block_to_db
from app.services.wallet_service import get_wallet_by_user
from app.config import get_settings

settings = get_settings()

def mine_pending_transactions(
    db: Session,
    miner_user: models.User
) -> schemas.MineResponse:
    """
    Mine all pending transactions into a new block.

    Process:
    1. Get pending transactions from DB
    2. Create mining reward transaction
    3. Run Proof of Work
    4. Save block to DB
    5. Mark transactions as confirmed
    6. Create reward transaction in DB
    """
    miner_wallet = get_wallet_by_user(db, miner_user.id)
    if not miner_wallet:
        raise HTTPException(status_code=404, detail="Miner wallet not found")

    # Get pending transactions
    pending = db.query(models.Transaction).filter(
        models.Transaction.status == models.TransactionStatus.PENDING
    ).all()

    if not pending:
        raise HTTPException(status_code=400, detail="No pending transactions to mine")

    # Convert to dicts for mining
    tx_dicts = []
    for tx in pending:
        tx_dicts.append({
            "id": tx.transaction_id,
            "sender": tx.sender_address,
            "receiver": tx.receiver_address,
            "amount": tx.amount,
            "type": tx.transaction_type.value,
        })

    # Mine
    bc = get_blockchain()
    engine = MiningEngine(bc, mining_reward=settings.MINING_REWARD)
    block, mining_time = engine.mine_block(
        transactions=tx_dicts,
        miner_address=miner_wallet.address,
        difficulty=settings.DIFFICULTY
    )

    # Save block
    save_block_to_db(db, block)

    # Update pending transactions to confirmed
    for tx in pending:
        tx.status = models.TransactionStatus.CONFIRMED
        tx.block_index = block.index

    # Create mining reward transaction in DB
    reward_tx = models.Transaction(
        transaction_id=f"reward_{block.index}",
        sender_address=None,
        receiver_address=miner_wallet.address,
        amount=settings.MINING_REWARD,
        transaction_type=models.TransactionType.MINING_REWARD,
        status=models.TransactionStatus.CONFIRMED,
        block_index=block.index,
        signature=None
    )
    db.add(reward_tx)
    db.commit()

    # Add block to in-memory chain
    bc.add_block(block)

    return schemas.MineResponse(
        success=True,
        block_index=block.index,
        nonce=block.nonce,
        hash=block.hash,
        mining_time_seconds=round(mining_time, 4),
        reward=settings.MINING_REWARD,
        transactions_included=len(pending),
        message=f"Block #{block.index} mined successfully with {len(pending)} transactions"
    )
