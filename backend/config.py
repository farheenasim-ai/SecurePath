from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    APP_NAME: str = "SecurePath API"
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "securepath_db"
    SECRET_KEY: str = "your-secret-key-for-jwt-change-it-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()
