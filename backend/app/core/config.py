"""
TravelMate AI - Application Settings
"""
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # OpenAI
    OPENAI_API_KEY: str = ""

    # Supabase
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_KEY: str = ""

    # App
    FRONTEND_URL: str = "http://localhost:5173"
    PORT: int = 8000

    # Demo Mode - works without real API keys
    DEMO_MODE: bool = True

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }

    @property
    def is_supabase_connected(self) -> bool:
        """Returns True if Supabase URL and keys are configured"""
        return bool(
            self.SUPABASE_URL 
            and self.SUPABASE_ANON_KEY 
            and self.SUPABASE_SERVICE_KEY
            and "supabase.co" in self.SUPABASE_URL
        )

    @property
    def is_demo_mode(self) -> bool:
        """Returns True if we should use demo data for AI"""
        return self.DEMO_MODE or not self.OPENAI_API_KEY

    @property
    def is_demo(self) -> bool:
        """Alias for is_demo_mode"""
        return self.is_demo_mode


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
