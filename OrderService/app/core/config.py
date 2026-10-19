from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    """
    Configuración centralizada de la aplicación.
    Lee automáticamente las variables de entorno del archivo .env.
    """
    # --- Información de la API ---
    PROJECT_NAME: str = "Subsonic Festival API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # --- Configuración CORS ---
    # En producción, esto debe venir del .env (ej: ["https://app.subsonic.com"])
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    # --- Seguridad y JWT ---
    # SECRET_KEY no tiene valor por defecto. Si no está en el .env, la app NO arrancará.
    SECRET_KEY: str 
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # --- Base de Datos MySQL ---
    DB_HOST: str = "127.0.0.1"
    DB_PORT: int = 3306
    DB_USER: str = "root"
    DB_PASSWORD: str = ""
    DB_NAME: str = "subsonic_db"

    # Configuración de Pydantic V2 para leer el archivo .env
    model_config = SettingsConfigDict(
        env_file=".env", 
        env_file_encoding="utf-8",
        case_sensitive=True # Respeta mayúsculas/minúsculas en las variables
    )

# Instanciamos la configuración para que pueda ser importada desde cualquier parte
settings = Settings()