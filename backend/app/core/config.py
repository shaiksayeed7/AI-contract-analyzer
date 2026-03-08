from pydantic_settings import BaseSettings
from functools import lru_cache
import os


class Settings(BaseSettings):
    APP_NAME: str = "LexiScan AI"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./lexiscan.db"

    # OpenAI
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o-mini"
    OPENAI_EMBEDDING_MODEL: str = "text-embedding-3-small"

    # Storage
    UPLOAD_DIR: str = "./uploads"
    MAX_UPLOAD_SIZE_MB: int = 50

    # Vector DB
    CHROMA_PERSIST_DIR: str = "./chroma_db"

    # AI context limits (in characters, approx 1 token ≈ 4 chars)
    AI_ANALYSIS_CONTEXT_CHARS: int = 12000
    AI_SUMMARY_CONTEXT_CHARS: int = 8000
    AI_CHAT_CONTEXT_CHARS: int = 6000
    AI_COMPARE_CONTEXT_CHARS: int = 6000

    # Security
    SECRET_KEY: str = "change-me-in-production-use-a-long-random-string"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # CORS
    FRONTEND_URL: str = "http://localhost:3000"

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()

# Warn loudly if using the default SECRET_KEY
if settings.SECRET_KEY == "change-me-in-production-use-a-long-random-string":
    import warnings
    warnings.warn(
        "WARNING: Using default SECRET_KEY. Set a strong SECRET_KEY in your .env file before deploying to production.",
        stacklevel=2,
    )
