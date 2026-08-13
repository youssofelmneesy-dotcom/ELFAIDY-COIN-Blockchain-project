"""
Elfaidy Coin - Game Engine
Server-side game session management and validation.
"""
import uuid
import secrets
from datetime import datetime, timedelta
from app.config import get_settings

settings = get_settings()

class GameEngine:
    """Manages game sessions with server-side validation."""

    def create_session(self, user_id: int) -> dict:
        """Create a new validated game session."""
        session_id = f"game_{secrets.token_hex(16)}"
        return {
            "session_id": session_id,
            "user_id": user_id,
            "started_at": datetime.utcnow(),
            "max_duration_seconds": settings.GAME_DURATION_SECONDS,
            "max_score": settings.MAX_GAME_SCORE,
        }

    def validate_completion(
        self,
        session: dict,
        score: int,
        completed_at: datetime
    ) -> tuple[bool, str, float]:
        """
        Validate a game completion request.

        Returns:
            Tuple of (is_valid, message, reward_amount)
        """
        started = session.get("started_at")
        if isinstance(started, str):
            started = datetime.fromisoformat(started)

        duration = (completed_at - started).total_seconds()

        # Check duration
        if duration > settings.GAME_DURATION_SECONDS + 5:  # 5s grace
            return False, "Game duration exceeded maximum allowed time", 0.0

        # Check score bounds
        if score < 0 or score > settings.MAX_GAME_SCORE:
            return False, f"Score must be between 0 and {settings.MAX_GAME_SCORE}", 0.0

        # Calculate reward: floor(score / 50), capped at MAX_GAME_REWARD
        reward = min(score // 50, settings.MAX_GAME_REWARD)

        return True, "Game validated successfully", float(reward)
