"""
Elfaidy Coin - Database Models
SQLAlchemy ORM models for Users, Wallets, Transactions, Blocks, GameSessions, FaucetClaims.
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum, Text, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum

class TransactionType(str, enum.Enum):
    GENESIS = "GENESIS"
    FAUCET_REWARD = "FAUCET_REWARD"
    MINING_REWARD = "MINING_REWARD"
    GAME_REWARD = "GAME_REWARD"
    TRANSFER = "TRANSFER"

class TransactionStatus(str, enum.Enum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    wallet = relationship("Wallet", back_populates="owner", uselist=False)
    faucet_claims = relationship("FaucetClaim", back_populates="user")
    game_sessions = relationship("GameSession", back_populates="user")

class Wallet(Base):
    __tablename__ = "wallets"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    address = Column(String(255), unique=True, index=True, nullable=False)
    public_key = Column(Text, nullable=False)
    private_key = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    owner = relationship("User", back_populates="wallet")
    sent_transactions = relationship("Transaction", foreign_keys="Transaction.sender_address", back_populates="sender_wallet")
    received_transactions = relationship("Transaction", foreign_keys="Transaction.receiver_address", back_populates="receiver_wallet")

class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(String(64), unique=True, index=True, nullable=False)
    sender_address = Column(String(255), ForeignKey("wallets.address"), nullable=True)
    receiver_address = Column(String(255), ForeignKey("wallets.address"), nullable=False)
    amount = Column(Float, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    signature = Column(Text, nullable=True)
    transaction_type = Column(Enum(TransactionType), nullable=False)
    status = Column(Enum(TransactionStatus), default=TransactionStatus.PENDING)
    block_index = Column(Integer, ForeignKey("blocks.index"), nullable=True)
    sender_wallet = relationship("Wallet", foreign_keys=[sender_address], back_populates="sent_transactions")
    receiver_wallet = relationship("Wallet", foreign_keys=[receiver_address], back_populates="received_transactions")
    block = relationship("Block", back_populates="transactions")

class Block(Base):
    __tablename__ = "blocks"
    index = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    previous_hash = Column(String(64), nullable=False)
    nonce = Column(Integer, nullable=False, default=0)
    difficulty = Column(Integer, nullable=False)
    hash = Column(String(64), unique=True, nullable=False)
    miner_address = Column(String(255), nullable=True)
    transactions = relationship("Transaction", back_populates="block")

class GameSession(Base):
    __tablename__ = "game_sessions"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(64), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    score = Column(Integer, nullable=True)
    reward = Column(Float, nullable=True)
    rewarded = Column(Boolean, default=False)
    user = relationship("User", back_populates="game_sessions")

class FaucetClaim(Base):
    __tablename__ = "faucet_claims"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    claimed_at = Column(DateTime(timezone=True), server_default=func.now())
    amount = Column(Float, nullable=False)
    user = relationship("User", back_populates="faucet_claims")
