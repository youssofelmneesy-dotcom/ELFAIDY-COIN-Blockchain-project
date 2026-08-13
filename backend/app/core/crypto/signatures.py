"""
Elfaidy Coin - Digital Signatures
ECDSA signature generation and verification using the cryptography library.

How it works:
- Sender hashes transaction data and signs with PRIVATE KEY.
- Anyone verifies using sender's PUBLIC KEY.
- If data changes, signature becomes invalid.
"""
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.exceptions import InvalidSignature
import base64

def generate_keypair() -> tuple[str, str]:
    """Generate ECDSA key pair (SECP256R1). Returns (private_pem, public_pem)."""
    private_key = ec.generate_private_key(ec.SECP256R1())
    private_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption()
    ).decode("utf-8")
    public_pem = private_key.public_key().public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    ).decode("utf-8")
    return private_pem, public_pem

def sign_data(private_key_pem: str, data: str) -> str:
    """Sign data with private key. Returns base64-encoded signature."""
    private_key = serialization.load_pem_private_key(private_key_pem.encode("utf-8"), password=None)
    signature = private_key.sign(data.encode("utf-8"), ec.ECDSA(hashes.SHA256()))
    return base64.b64encode(signature).decode("utf-8")

def verify_signature(public_key_pem: str, data: str, signature_b64: str) -> bool:
    """Verify signature with public key. Returns True if valid."""
    try:
        public_key = serialization.load_pem_public_key(public_key_pem.encode("utf-8"))
        signature = base64.b64decode(signature_b64.encode("utf-8"))
        public_key.verify(signature, data.encode("utf-8"), ec.ECDSA(hashes.SHA256()))
        return True
    except (InvalidSignature, Exception):
        return False
