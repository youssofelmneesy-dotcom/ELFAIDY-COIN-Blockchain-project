"""
Elfaidy Coin - Transaction Core Logic
Transaction creation, signing, and validation utilities.
"""
import uuid
from datetime import datetime
from app.core.crypto.signatures import sign_data, verify_signature
from app.core.crypto.hashing import hash_dict

def generate_transaction_id() -> str:
    """Generate a unique transaction ID using UUID4."""
    return f"tx_{uuid.uuid4().hex}"

def create_transaction_payload(
    sender_address: str,
    receiver_address: str,
    amount: float,
    timestamp: datetime
) -> dict:
    """Create the canonical transaction payload for signing."""
    return {
        "sender": sender_address,
        "receiver": receiver_address,
        "amount": amount,
        "timestamp": timestamp.isoformat(),
    }

def sign_transaction(private_key: str, payload: dict) -> str:
    """Sign a transaction payload with the sender's private key."""
    data = hash_dict(payload)
    return sign_data(private_key, data)

def verify_transaction_signature(
    public_key: str,
    payload: dict,
    signature: str
) -> bool:
    """Verify a transaction signature using the sender's public key."""
    data = hash_dict(payload)
    return verify_signature(public_key, data, signature)
