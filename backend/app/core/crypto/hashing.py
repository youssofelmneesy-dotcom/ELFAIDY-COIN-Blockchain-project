"""
Elfaidy Coin - Cryptographic Hashing
SHA-256 hashing utilities for blocks, transactions, and data integrity.
"""
import hashlib
import json
from typing import Any

def sha256_hash(data: str) -> str:
    """Compute SHA-256 hash of a string. Returns 64-char hex string."""
    return hashlib.sha256(data.encode("utf-8")).hexdigest()

def hash_dict(data: dict) -> str:
    """Deterministically hash a dictionary by sorting keys and JSON encoding."""
    canonical = json.dumps(data, sort_keys=True, separators=(",", ":"))
    return sha256_hash(canonical)

def hash_block_data(index: int, timestamp: str, transactions: list, previous_hash: str, nonce: int, difficulty: int) -> str:
    """Compute the hash of a block's core data."""
    block_data = {
        "index": index,
        "timestamp": timestamp,
        "transactions": transactions,
        "previous_hash": previous_hash,
        "nonce": nonce,
        "difficulty": difficulty,
    }
    return hash_dict(block_data)
