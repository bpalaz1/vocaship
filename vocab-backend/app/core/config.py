import os
from pathlib import Path
from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict

# .env dosyasını os.environ içine tam olarak yükle
env_path = Path(__file__).resolve().parent.parent.parent / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path, override=True)
else:
    load_dotenv(override=True)

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    PROJECT_NAME: str = "Vocaship"
    API_V1_STR: str = "/api/v1"
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    GEMINI_API_KEY: str = ""

settings = Settings()

# Tırnakları temizle ve os.environ senkronize et
raw_key = os.getenv("GEMINI_API_KEY") or settings.GEMINI_API_KEY or ""
cleaned_key = str(raw_key).strip().strip('"\'').strip()
settings.GEMINI_API_KEY = cleaned_key
os.environ["GEMINI_API_KEY"] = cleaned_key