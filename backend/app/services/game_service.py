"""
Elfaidy Coin - Game Service
Manages game sessions, validation, and reward distribution.
"""
from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app import models, schemas
from app.core.game.game_engine import GameEngine
from app.services.wallet_service import get_wallet_by_user
from app.config import get_settings

settings = get_settings()

# In-memory session storage (for demo; in production use Redis)
_active_sessions = {}

def start_game_session(db: Session, user: models.User) -> schemas.GameStartResponse:
    """Start a new game session with server-side tracking."""
    engine = GameEngine()
    session_data = engine.create_session(user.id)

    # Persist to DB
    db_session = models.GameSession(
        session_id=session_data["session_id"],
        user_id=user.id,
        started_at=session_data["started_at"]
    )
    db.add(db_session)
    db.commit()

    # Cache in memory (serialize datetime for consistency)
    _active_sessions[session_data["session_id"]] = {
        "session_id": session_data["session_id"],
        "user_id": user.id,
        "started_at": session_data["started_at"].isoformat(),
        "max_duration_seconds": session_data["max_duration_seconds"],
        "max_score": session_data["max_score"]
    }

    return schemas.GameStartResponse(
        session_id=session_data["session_id"],
        started_at=session_data["started_at"],
        max_duration_seconds=session_data["max_duration_seconds"],
        message="Game session started. Catch coins, avoid red penalties!"
    )

def complete_game_session(
    db: Session,
    user: models.User,
    completion: schemas.GameCompleteRequest
) -> schemas.GameCompleteResponse:
    """Complete a game session with backend validation and reward."""
    # Find session
    db_session = db.query(models.GameSession).filter(
        models.GameSession.session_id == completion.session_id,
        models.GameSession.user_id == user.id
    ).first()

    if not db_session:
        raise HTTPException(status_code=404, detail="Game session not found")

    if db_session.rewarded:
        raise HTTPException(status_code=400, detail="This session has already been rewarded")

    # Validate
    engine = GameEngine()
    session_data = _active_sessions.get(completion.session_id)
    if not session_data:
        session_data = {
            "started_at": db_session.started_at.isoformat() if db_session.started_at else datetime.utcnow().isoformat(),
            "user_id": user.id,
            "max_duration_seconds": settings.GAME_DURATION_SECONDS,
            "max_score": settings.MAX_GAME_SCORE
        }

    is_valid, message, reward = engine.validate_completion(
        session=session_data,
        score=completion.score,
        completed_at=datetime.utcnow()
    )

    if not is_valid:
        raise HTTPException(status_code=400, detail=message)

    if reward <= 0:
        return schemas.GameCompleteResponse(
            success=True,
            session_id=completion.session_id,
            score=completion.score,
            reward=0.0,
            transaction_id=None,
            message="Game completed but no reward earned (score too low)"
        )

    # Update session
    db_session.completed_at = datetime.utcnow()
    db_session.score = completion.score
    db_session.reward = reward
    db_session.rewarded = True

    # Create reward transaction
    wallet = get_wallet_by_user(db, user.id)
    if wallet:
        tx = models.Transaction(
            transaction_id=f"game_{completion.session_id}",
            sender_address=None,
            receiver_address=wallet.address,
            amount=reward,
            transaction_type=models.TransactionType.GAME_REWARD,
            status=models.TransactionStatus.CONFIRMED,
            signature=None
        )
        db.add(tx)

    db.commit()

    # Clean up memory
    _active_sessions.pop(completion.session_id, None)

    return schemas.GameCompleteResponse(
        success=True,
        session_id=completion.session_id,
        score=completion.score,
        reward=reward,
        transaction_id=f"game_{completion.session_id}" if wallet else None,
        message=f"Game completed! You earned {reward} EFC"
    )

def get_game_history(db: Session, user_id: int) -> list:
    """Get game history for a user."""
    sessions = db.query(models.GameSession).filter(
        models.GameSession.user_id == user_id
    ).order_by(models.GameSession.started_at.desc()).all()
    return sessions
