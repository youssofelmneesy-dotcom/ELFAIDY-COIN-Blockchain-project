"""
Elfaidy Coin - Pydantic Schemas
Request and response models for API validation and serialization.
"""
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import Optional, List
from datetime import datetime
from enum import Enum

class UserRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)
    confirm_password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    username: str
    email: str
    created_at: datetime

class WalletResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    user_id: int
    address: str
    public_key: str
    created_at: datetime

class WalletDetailResponse(WalletResponse):
    balance: float = 0.0
    transaction_count: int = 0

class WalletBalance(BaseModel):
    address: str
    confirmed_balance: float
    pending_outgoing: float
    available_balance: float

class TransactionTypeEnum(str, Enum):
    GENESIS = "GENESIS"
    FAUCET_REWARD = "FAUCET_REWARD"
    MINING_REWARD = "MINING_REWARD"
    GAME_REWARD = "GAME_REWARD"
    TRANSFER = "TRANSFER"

class TransactionStatusEnum(str, Enum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"

class TransactionCreate(BaseModel):
    receiver_address: Optional[str] = None
    receiver_username: Optional[str] = None
    amount: float = Field(..., gt=0)

class TransactionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    transaction_id: str
    sender_address: Optional[str]
    receiver_address: str
    amount: float
    timestamp: datetime
    transaction_type: TransactionTypeEnum
    status: TransactionStatusEnum
    block_index: Optional[int]
    signature: Optional[str] = None

class TransactionDetailResponse(TransactionResponse):
    signature_valid: Optional[bool] = None

class BlockResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    index: int
    timestamp: datetime
    previous_hash: str
    nonce: int
    difficulty: int
    hash: str
    miner_address: Optional[str]
    transaction_count: int
    transactions: List[TransactionResponse] = []

class BlockchainStatus(BaseModel):
    total_blocks: int
    total_transactions: int
    is_valid: bool
    genesis_block_hash: str
    latest_block_hash: str

class ValidationResult(BaseModel):
    valid: bool
    message: str
    details: List[str] = []

class TamperRequest(BaseModel):
    block_index: int = Field(..., ge=0)
    new_amount: float = Field(..., gt=0)

class TamperResponse(BaseModel):
    block_index: int
    original_hash: str
    current_hash: str
    previous_hash: str
    valid_before: bool
    valid_after: bool
    message: str

class MineRequest(BaseModel):
    miner_address: Optional[str] = None

class MineResponse(BaseModel):
    success: bool
    block_index: int
    nonce: int
    hash: str
    mining_time_seconds: float
    reward: float
    transactions_included: int
    message: str

class FaucetStatus(BaseModel):
    can_claim: bool
    last_claimed: Optional[datetime]
    next_claim_available: Optional[datetime]
    reward_amount: float
    cooldown_hours: int

class FaucetClaimResponse(BaseModel):
    success: bool
    amount: float
    transaction_id: str
    message: str

class GameStartResponse(BaseModel):
    session_id: str
    started_at: datetime
    max_duration_seconds: int
    message: str

class GameCompleteRequest(BaseModel):
    session_id: str
    score: int = Field(..., ge=0)

class GameCompleteResponse(BaseModel):
    success: bool
    session_id: str
    score: int
    reward: float
    transaction_id: Optional[str]
    message: str

class GameHistoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    session_id: str
    score: Optional[int]
    reward: Optional[float]
    rewarded: bool
    started_at: datetime
    completed_at: Optional[datetime]

class StatisticsResponse(BaseModel):
    total_users: int
    total_wallets: int
    total_blocks: int
    total_transactions: int
    total_transfers: int
    total_mining_rewards: float
    total_game_rewards: float
    total_faucet_rewards: float
    total_transfer_volume: float
    efc_circulation: float
    pending_transactions: int
    difficulty: int
    mining_reward: float

class UserSearchResult(BaseModel):
    id: int
    username: str
    wallet_address: str

