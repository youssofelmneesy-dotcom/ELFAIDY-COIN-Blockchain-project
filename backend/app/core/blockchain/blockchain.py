"""
Elfaidy Coin - Blockchain Core
Manages the chain of blocks, validation, and tampering detection.
"""

from datetime import datetime
from typing import List

from app.core.blockchain.block import Block


class Blockchain:
    """The Elfaidy Coin blockchain: a linked list of blocks secured by hashes."""

    def __init__(self, difficulty: int = 4, genesis_supply: float = 100_000):
        self.difficulty = difficulty
        self.genesis_supply = genesis_supply
        self.chain: List[Block] = []
        self.create_genesis_block()

    def create_genesis_block(self) -> Block:
        """Create the immutable genesis block (Block #0) with initial supply."""

        genesis_tx = {
            "id": "genesis_0",
            "sender": None,
            "receiver": "GENESIS",
            "amount": self.genesis_supply,
            "type": "GENESIS",
        }

        genesis = Block(
            index=0,
            timestamp=datetime.utcnow(),
            transactions=[genesis_tx],
            previous_hash="0" * 64,
            nonce=0,
            difficulty=self.difficulty,
            miner_address="GENESIS",
        )

        # Genesis block does not require Proof of Work.
        self.chain.append(genesis)

        return genesis

    def get_latest_block(self) -> Block:
        """Return the most recent block in the chain."""
        return self.chain[-1]

    def add_block(self, block: Block) -> bool:
        """Add a new block after validation."""

        if not self.validate_new_block(block):
            return False

        self.chain.append(block)
        return True

    def validate_new_block(self, block: Block) -> bool:
        """Validate a block before adding it to the chain."""

        latest = self.get_latest_block()

        if block.index != latest.index + 1:
            return False

        if block.previous_hash != latest.hash:
            return False

        if not block.is_valid():
            return False

        if block.hash != block.compute_hash():
            return False

        return True

    def validate_chain(self) -> tuple[bool, List[str]]:
        """
        Validate the entire blockchain.

        Checks:
        - Genesis block integrity
        - Block hash correctness
        - Previous hash linkage
        - Proof of Work validity for non-genesis blocks

        Returns:
            Tuple of (is_valid, list_of_error_messages)
        """

        errors = []

        if len(self.chain) == 0:
            errors.append("Blockchain is empty")
            return False, errors

        # ---------------------------------------------------------
        # Validate Genesis Block
        # ---------------------------------------------------------

        genesis = self.chain[0]

        if genesis.index != 0:
            errors.append("Genesis block index must be 0")

        if genesis.previous_hash != "0" * 64:
            errors.append("Genesis block previous hash must be zeros")

        # Genesis does NOT require Proof of Work.
        # We only verify that the stored hash matches
        # the actual data inside the loaded genesis block.
        if genesis.hash != genesis.compute_hash():
            errors.append("Genesis block hash mismatch")

        # ---------------------------------------------------------
        # Validate Remaining Blocks
        # ---------------------------------------------------------

        for i in range(1, len(self.chain)):
            current = self.chain[i]
            previous = self.chain[i - 1]

            # Block index
            if current.index != i:
                errors.append(
                    f"Block #{i} has invalid index {current.index}"
                )

            # Previous hash linkage
            if current.previous_hash != previous.hash:
                errors.append(
                    f"Block #{i} previous hash does not match block #{i - 1}"
                )

            # Current block hash integrity
            if current.hash != current.compute_hash():
                errors.append(
                    f"Block #{i} hash mismatch "
                    f"(data may have been tampered)"
                )

            # Proof of Work
            if not current.is_valid():
                errors.append(
                    f"Block #{i} does not satisfy difficulty target"
                )

        return len(errors) == 0, errors

    def is_valid(self) -> bool:
        """Quick check if the blockchain is valid."""

        valid, _ = self.validate_chain()
        return valid

    def tamper_block(self, index: int, new_data: dict) -> Block:
        """
        Simulate tampering with a block's data for the educational demo.

        The block data is modified and its hash is recalculated.
        Since the nonce is not re-mined, the block should fail
        Proof of Work validation.
        """

        if index < 0 or index >= len(self.chain):
            raise ValueError("Invalid block index")

        block = self.chain[index]

        # Modify transaction data
        if block.transactions and len(block.transactions) > 0:
            if isinstance(block.transactions[0], dict):
                block.transactions[0].update(new_data)
            else:
                # Fallback for non-dict transaction objects
                block.transactions = [
                    {
                        "id": "tampered",
                        "amount": new_data.get("amount", 0),
                    }
                ]

        # Recompute hash after tampering.
        # The nonce was not re-mined, so PoW should become invalid.
        block.hash = block.compute_hash()

        return block

    def __len__(self):
        return len(self.chain)

    def __repr__(self):
        return (
            f"Blockchain("
            f"blocks={len(self.chain)}, "
            f"valid={self.is_valid()}"
            f")"
        )
        
        