"""
Elfaidy Coin - Application Configuration
Centralized configuration using Pydantic Settings.
"""
from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    GENESIS_SUPPLY: int = 100_000
    MINING_REWARD: int = 50
    DIFFICULTY: int = 4
    FAUCET_REWARD: int = 100
    FAUCET_COOLDOWN_HOURS: int = 24
    MAX_GAME_REWARD: int = 25
    MAX_GAME_SCORE: int = 1000
    GAME_DURATION_SECONDS: int = 45
    DATABASE_URL: str = "sqlite:///./elfaidy_coin.db"
    FRONTEND_URL: str = "http://localhost:5173"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

@lru_cache()
def get_settings() -> Settings:
    return Settings()
