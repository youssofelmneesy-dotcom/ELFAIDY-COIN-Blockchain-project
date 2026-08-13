"""
Elfaidy Coin - Blockchain Service
Manages blockchain state, persistence, validation, and tampering demo.
"""

from sqlalchemy.orm import Session

from app import models
from app.core.blockchain.blockchain import Blockchain
from app.core.blockchain.block import Block
from app.config import get_settings


settings = get_settings()

# In-memory blockchain singleton
_blockchain_instance = None


def get_blockchain() -> Blockchain:
    """Get or create the singleton blockchain instance."""
    global _blockchain_instance

    if _blockchain_instance is None:
        _blockchain_instance = Blockchain(
            difficulty=settings.DIFFICULTY,
            genesis_supply=settings.GENESIS_SUPPLY,
        )

    return _blockchain_instance


def initialize_blockchain_from_db(db: Session) -> Blockchain:
    """
    Initialize blockchain from database.

    If the database is empty:
        - Create genesis block
        - Save genesis block
        - Save genesis transaction

    If blocks already exist:
        - Rebuild the in-memory blockchain from DB
    """

    global _blockchain_instance

    # Create a fresh blockchain object.
    # This automatically creates a genesis block in memory.
    bc = Blockchain(
        difficulty=settings.DIFFICULTY,
        genesis_supply=settings.GENESIS_SUPPLY,
    )

    # Get existing blocks from database
    db_blocks = (
        db.query(models.Block)
        .order_by(models.Block.index)
        .all()
    )

    # =========================================================
    # FIRST RUN - DATABASE HAS NO BLOCKS
    # =========================================================

    if not db_blocks:

        genesis = bc.chain[0]

        # Save genesis block
        db_genesis = models.Block(
            index=genesis.index,
            timestamp=genesis.timestamp,
            previous_hash=genesis.previous_hash,
            nonce=genesis.nonce,
            difficulty=genesis.difficulty,
            hash=genesis.hash,
            miner_address=genesis.miner_address,
        )

        db.add(db_genesis)
        db.flush()

        # Save genesis transaction
        genesis_tx = genesis.transactions[0]

        db_genesis_tx = models.Transaction(
            transaction_id=genesis_tx["id"],
            sender_address=None,
            receiver_address=genesis_tx["receiver"],
            amount=genesis_tx["amount"],
            timestamp=genesis.timestamp,
            transaction_type=models.TransactionType.GENESIS,
            status=models.TransactionStatus.CONFIRMED,
            block_index=genesis.index,
        )

        db.add(db_genesis_tx)

        db.commit()

        _blockchain_instance = bc

        return bc

    # =========================================================
    # EXISTING BLOCKCHAIN - LOAD FROM DATABASE
    # =========================================================

    loaded_chain = []

    for db_block in db_blocks:

        # Load transactions belonging to this block
        txs = (
            db.query(models.Transaction)
            .filter(
                models.Transaction.block_index == db_block.index
            )
            .order_by(models.Transaction.id)
            .all()
        )

        tx_dicts = []

        for tx in txs:

            tx_dicts.append(
                {
                    "id": tx.transaction_id,
                    "sender": tx.sender_address,
                    "receiver": tx.receiver_address,
                    "amount": tx.amount,
                    "type": tx.transaction_type.value,
                }
            )

        # Rebuild block from database
        block = Block(
            index=db_block.index,
            timestamp=db_block.timestamp,
            transactions=tx_dicts,
            previous_hash=db_block.previous_hash,
            nonce=db_block.nonce,
            difficulty=db_block.difficulty,
            hash_value=db_block.hash,
            miner_address=db_block.miner_address,
        )

        loaded_chain.append(block)

    # Replace in-memory chain with database chain
    bc.chain = loaded_chain

    _blockchain_instance = bc

    return bc


def save_block_to_db(
    db: Session,
    block: Block,
) -> models.Block:
    """Persist a mined block to the database."""

    db_block = models.Block(
        index=block.index,
        timestamp=block.timestamp,
        previous_hash=block.previous_hash,
        nonce=block.nonce,
        difficulty=block.difficulty,
        hash=block.hash,
        miner_address=block.miner_address,
    )

    db.add(db_block)
    db.commit()
    db.refresh(db_block)

    return db_block


def get_block_by_index(
    db: Session,
    index: int,
) -> models.Block:
    """Get a block by its index."""

    return (
        db.query(models.Block)
        .filter(models.Block.index == index)
        .first()
    )


def get_all_blocks(db: Session) -> list:
    """Get all blocks ordered by index."""

    return (
        db.query(models.Block)
        .order_by(models.Block.index)
        .all()
    )


def validate_blockchain(db: Session) -> dict:
    """Validate the entire blockchain."""

    bc = get_blockchain()

    valid, errors = bc.validate_chain()

    return {
        "valid": valid,
        "message": (
            "Blockchain is valid"
            if valid
            else "Blockchain is INVALID"
        ),
        "details": (
            errors
            if errors
            else ["All blocks verified successfully"]
        ),
    }


def simulate_tampering(
    db: Session,
    block_index: int,
    new_amount: float,
) -> dict:
    """
    Simulate tampering with a block.

    The transaction data is changed without re-mining the block.
    This should make the block invalid.
    """

    bc = get_blockchain()

    # Validate block index
    if block_index < 0 or block_index >= len(bc.chain):
        raise ValueError("Invalid block index")

    block = bc.chain[block_index]

    # Save original state
    original_hash = block.hash

    valid_before = (
        block.hash == block.compute_hash()
        and block.is_valid()
    )

    # =========================================================
    # MODIFY TRANSACTION
    # =========================================================

    if block.transactions:

        if isinstance(block.transactions[0], dict):

            block.transactions[0]["amount"] = new_amount

        else:

            block.transactions = [
                {
                    "id": "tampered",
                    "amount": new_amount,
                }
            ]

    # IMPORTANT:
    # DO NOT recompute the hash here.
    #
    # Keeping the old hash allows the validation system
    # to detect that the block data was modified.

    valid_after = (
        block.hash == block.compute_hash()
        and block.is_valid()
    )

    return {
        "block_index": block_index,
        "original_hash": original_hash,
        "current_hash": block.hash,
        "previous_hash": block.previous_hash,
        "valid_before": valid_before,
        "valid_after": valid_after,
        "message": (
            f"Block #{block_index} tampered: "
            "amount changed. Hash mismatch detected."
        ),
    }
    
    