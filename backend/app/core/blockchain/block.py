"""
Elfaidy Coin - Block Model
Represents a single block in the blockchain with deterministic SHA-256 hashing.
"""

from datetime import datetime
from typing import List, Optional

from app.core.crypto.hashing import hash_block_data


class Block:
    """A block containing transactions linked to the previous block."""

    def __init__(
        self,
        index: int,
        timestamp: datetime,
        transactions: List[dict],
        previous_hash: str,
        nonce: int = 0,
        difficulty: int = 4,
        hash_value: Optional[str] = None,
        miner_address: Optional[str] = None,
    ):
        self.index = index
        self.timestamp = timestamp
        self.transactions = transactions
        self.previous_hash = previous_hash
        self.nonce = nonce
        self.difficulty = difficulty
        self.miner_address = miner_address

        if hash_value is None:
            self.hash = self.compute_hash()
        else:
            self.hash = hash_value

    def _normalize_transactions(self) -> List[dict]:
        """
        Convert transactions into one deterministic representation.

        This method MUST produce exactly the same structure whether
        transactions come from memory or from the database.
        """

        normalized = []

        for tx in self.transactions:

            # ORM transaction object
            if hasattr(tx, "transaction_id"):

                transaction_type = tx.transaction_type

                if hasattr(transaction_type, "value"):
                    transaction_type = transaction_type.value

                normalized.append(
                    {
                        "id": tx.transaction_id,
                        "sender": tx.sender_address,
                        "receiver": tx.receiver_address,
                        "amount": float(tx.amount),
                        "type": transaction_type,
                    }
                )

            # Dictionary transaction
            else:

                normalized.append(
                    {
                        "id": tx.get("id"),
                        "sender": tx.get("sender"),
                        "receiver": tx.get("receiver"),
                        "amount": float(tx.get("amount")),
                        "type": tx.get("type"),
                    }
                )

        return normalized

    def compute_hash(self) -> str:
        """
        Compute deterministic SHA-256 hash of the block.

        Only canonical blockchain data is included in the hash.
        """

        tx_list = self._normalize_transactions()

        return hash_block_data(
            index=self.index,
            timestamp=self.timestamp.isoformat(),
            transactions=tx_list,
            previous_hash=self.previous_hash,
            nonce=self.nonce,
            difficulty=self.difficulty,
        )

    def to_dict(self) -> dict:
        """Serialize block to dictionary."""

        return {
            "index": self.index,
            "timestamp": self.timestamp.isoformat(),
            "transactions": self.transactions,
            "previous_hash": self.previous_hash,
            "nonce": self.nonce,
            "difficulty": self.difficulty,
            "hash": self.hash,
            "miner_address": self.miner_address,
        }

    def is_valid(self) -> bool:
        """Check whether block satisfies the difficulty target."""

        # Genesis block does not require Proof of Work.
        if self.index == 0:
            return True

        target = "0" * self.difficulty
        return self.hash.startswith(target)

    def __repr__(self):
        return (
            f"Block(#{self.index}, "
            f"hash={self.hash[:16]}..., "
            f"txs={len(self.transactions)})"
        )
        
        