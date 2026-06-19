import os
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "TalentFlow API"

    # Banco de dados — Neon.tech em producao, PostgreSQL local em dev
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/talentflow"

    # Groq API — substitui Gemini
    GROQ_API_KEY: str = ""

    # Gemini API para OCR em PDFs escaneados
    GEMINI_API_KEY: str = ""

    # Cloudinary — armazenamento de PDFs e fotos
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""

    # SMTP Configs (Email Dispatch)
    SMTP_HOST: str = "smtp-relay.brevo.com"
    SMTP_PORT: int = 587
    SMTP_USERNAME: str = ""
    SMTP_PASSWORD: str = ""

    # Frontend URL (for links)
    FRONTEND_URL: str = "http://localhost:3000"

    # JWT Secret Key
    SECRET_KEY: str = "talentflow_super_secret_key_60fps_premium"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
