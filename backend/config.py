from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    database_url: str = "postgresql://postgres:20201020@localhost/nexusedu"
    jwt_secret_key: str = "NEXUS_SECRET_CHANGE_ME_IN_PRODUCTION"
    jwt_algorithm: str = "HS256"
    jwt_expiry_hours: int = 168
    ollama_url: str = "http://localhost:11434/api/generate"
    ollama_model: str = "llama3"
    gemini_api_key: Optional[str] = None
    openrouter_api_key: Optional[str] = None
    together_api_key: Optional[str] = None
    mercadopago_access_token: Optional[str] = None
    mercadopago_webhook_secret: Optional[str] = None
    tesseract_cmd: str = "tesseract"
    host: str = "0.0.0.0"
    port: int = 8000
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173,capacitor://localhost,http://localhost"
    rate_limit_per_minute: int = 30
    max_upload_size_mb: int = 50

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
