"""
Elfaidy Coin - Wallet Generation
Generates cryptographically secure wallet addresses from public keys.

Address format: EFC_<sha256_hash_prefix>
"""
import hashlib
from app.core.crypto.signatures import generate_keypair

def generate_wallet_address(public_key_pem: str) -> str:
    """Generate unique wallet address from public key."""
    hash_digest = hashlib.sha256(public_key_pem.encode("utf-8")).hexdigest()
    return f"EFC_{hash_digest[:28]}"

def create_wallet() -> dict:
    """Create a new wallet with secure keys. Returns dict with address, public_key, private_key."""
    private_key, public_key = generate_keypair()
    address = generate_wallet_address(public_key)
    return {"address": address, "public_key": public_key, "private_key": private_key}
