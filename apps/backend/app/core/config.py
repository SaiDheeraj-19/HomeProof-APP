from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """
    Validates environment variables on startup.
    Fails fast if required variables are missing.
    """
    # Environment
    ENV: str = "development"
    
    # Supabase
    SUPABASE_URL: str
    SUPABASE_SERVICE_ROLE_KEY: str
    
    # AI Providers
    GEMINI_API_KEY: str
    GROQ_API_KEY: str
    SARVAM_API_KEY: str = "" # Optional for now
    
    # Redis/Celery
    REDIS_URL: str = "redis://localhost:6379/0"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

# Instantiate to validate immediately on import
settings = Settings()
