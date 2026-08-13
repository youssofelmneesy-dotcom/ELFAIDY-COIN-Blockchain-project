"""
Elfaidy Coin - FastAPI Application Entry Point
Initializes the database, blockchain, and mounts all API routes.
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.config import get_settings
from app.services.blockchain_service import initialize_blockchain_from_db
from app.api.routes import (
    auth, users, wallets, transactions,
    blockchain, mining, game, faucet, statistics
)

settings = get_settings()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: create tables and initialize blockchain."""
    # Startup
    Base.metadata.create_all(bind=engine)
    from app.database import SessionLocal
    db = SessionLocal()
    try:
        initialize_blockchain_from_db(db)
    finally:
        db.close()
    yield
    # Shutdown
    pass

app = FastAPI(
    title="Elfaidy Coin API",
    description="Educational Cryptocurrency Platform API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth")
app.include_router(users.router, prefix="/api/users")
app.include_router(wallets.router, prefix="/api/wallets")
app.include_router(transactions.router, prefix="/api/transactions")
app.include_router(blockchain.router, prefix="/api/blockchain")
app.include_router(mining.router, prefix="/api/mining")
app.include_router(game.router, prefix="/api/game")
app.include_router(faucet.router, prefix="/api/faucet")
app.include_router(statistics.router, prefix="/api/statistics")

@app.get("/api/health")
def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "elfaidy-coin-api"}

@app.get("/")
def root():
    """Root endpoint."""
    return {
        "name": "Elfaidy Coin API",
        "description": "Educational Cryptocurrency Platform",
        "version": "1.0.0",
        "docs": "/docs"
    }
