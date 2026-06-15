import os
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "TalentFlow API"

    # Banco de dados — Neon.tech em producao, PostgreSQL local em dev
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/talentflow"

    # Groq API — substitui Gemini
    GROQ_API_KEY: str = ""

    # Cloudinary — armazenamento de PDFs e fotos
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
