"""
Elfaidy Coin - Mining Engine
Proof of Work implementation: find a nonce such that block hash starts with N zeros.
"""
import time
from datetime import datetime
from typing import List, Optional
from app.core.blockchain.block import Block
from app.core.blockchain.blockchain import Blockchain

class MiningEngine:
    """Handles Proof of Work mining for new blocks."""

    def __init__(self, blockchain: Blockchain, mining_reward: float = 50):
        self.blockchain = blockchain
        self.mining_reward = mining_reward

    def mine_block(
        self,
        transactions: List[dict],
        miner_address: str,
        difficulty: Optional[int] = None
    ) -> tuple[Block, float]:
        """
        Mine a new block containing the given transactions.

        Args:
            transactions: List of transaction dictionaries to include.
            miner_address: Wallet address of the miner (for reward).
            difficulty: Override difficulty (defaults to blockchain difficulty).

        Returns:
            Tuple of (mined_block, mining_time_seconds)
        """
        if difficulty is None:
            difficulty = self.blockchain.difficulty

        latest = self.blockchain.get_latest_block()
        index = latest.index + 1
        previous_hash = latest.hash
        timestamp = datetime.utcnow()

        # Add mining reward transaction
        reward_tx = {
            "id": f"reward_{index}",
            "sender": None,
            "receiver": miner_address,
            "amount": self.mining_reward,
            "type": "MINING_REWARD",
        }
        all_transactions = [reward_tx] + transactions

        block = Block(
            index=index,
            timestamp=timestamp,
            transactions=all_transactions,
            previous_hash=previous_hash,
            nonce=0,
            difficulty=difficulty,
            miner_address=miner_address
        )

        start_time = time.time()
        target = "0" * difficulty

        # Proof of Work: increment nonce until hash satisfies difficulty
        while not block.hash.startswith(target):
            block.nonce += 1
            block.hash = block.compute_hash()

        mining_time = time.time() - start_time
        return block, mining_time
