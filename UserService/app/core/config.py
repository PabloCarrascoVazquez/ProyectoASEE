from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    """
    Configuración centralizada de la aplicación.
    Lee automáticamente las variables de entorno del archivo .env.
    """
    PROJECT_NAME: str = "Subsonic Festival API - User Service"
    VERSION: str = "1.0.0"
    PORT: int = 8001

    # --- Configuración CORS ---
    # Acepta orígenes definidos como lista JSON en el .env o lista por defecto
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000"
    ]

    # --- Seguridad y JWT ---
    SECRET_KEY: str  # Obligatorio en .env; si falta, la app no arranca
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # --- Base de Datos ---
    DB_ENGINE: str = "sqlite"  # 'sqlite' o 'mysql'
    DB_HOST: str = "127.0.0.1"
    DB_PORT: int = 3306
    DB_USER: str = "root"
    DB_PASSWORD: str = ""
    DB_NAME: str = "users_db"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"  # Ignora variables extra en el .env sin fallar
    )

# Instancia global accesible desde cualquier módulo
settings = Settings()