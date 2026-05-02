from pydantic_settings import BaseSettings
import os


class Settings(BaseSettings):
    # ── AI Model ──────────────────────────────────────────────────────────────
    MODEL_NAME: str = "deepset/xlm-roberta-base-squad2"
    MAX_SEQ_LENGTH: int = 512

    # ── Storage ───────────────────────────────────────────────────────────────
    UPLOAD_DIR: str = "uploads"

    # ── Chunking ──────────────────────────────────────────────────────────────
    CHUNK_SIZE: int = 350        # ~300-400 chars per chunk
    CHUNK_OVERLAP: int = 50      # 50 chars overlap

    # ── Project Limits ────────────────────────────────────────────────────────
    MAX_PROJECTS: int = 10
    MAX_PDFS_PER_PROJECT: int = 5
    MAX_PDF_SIZE_MB: int = 5

    # ── Conversation Limits ───────────────────────────────────────────────────
    MAX_CONVERSATIONS_PER_PROJECT: int = 20
    CONVERSATION_TTL_DAYS: int = 7

    # ── QA Pipeline ───────────────────────────────────────────────────────────
    QA_TOP_K: int = 5
    QA_SCORE_THRESHOLD: float = 0.30
    QA_MAX_ANSWER_CHARS: int = 200
    QA_CONTEXT_MAX_CHARS: int = 1000

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
