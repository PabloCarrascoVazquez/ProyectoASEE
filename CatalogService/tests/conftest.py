import os
import tempfile
import jwt
import pytest
from datetime import datetime, timedelta, timezone

from app import create_app
from app.daos.factories import DatabaseConnectionFactory
from app.daos.sqlite_impl.catalog_dao import CatalogDAOSQLite
from app.services.catalog_service import CatalogService
from app.core.config import settings

@pytest.fixture(scope="session")
def secret_key():
    """Forzamos una clave secreta para el entorno de tests."""
    os.environ["SECRET_KEY"] = "test-super-secret-key-1234567890"
    settings.SECRET_KEY = "test-super-secret-key-1234567890"
    return settings.SECRET_KEY

@pytest.fixture
def temp_db(secret_key):
    """Crea una base de datos SQLite temporal y limpia al finalizar cada test."""
    fd, path = tempfile.mkstemp(suffix=".db")
    os.close(fd)

    # Configurar variable de entorno para que DatabaseConnectionFactory use este archivo
    os.environ["SQLITE_DB_PATH"] = path
    os.environ["DB_ENGINE"] = "sqlite"

    DatabaseConnectionFactory.close_sqlite()
    conn = DatabaseConnectionFactory.get_connection()

    yield {
        "path": path,
        "conn": conn
    }

    DatabaseConnectionFactory.close_sqlite()
    if os.path.exists(path):
        try:
            os.remove(path)
        except OSError:
            pass

@pytest.fixture
def catalog_dao(temp_db):
    """Instancia de CatalogDAOSQLite conectada a la BD de pruebas."""
    return CatalogDAOSQLite(temp_db["conn"])

@pytest.fixture
def catalog_service(catalog_dao):
    """Instancia de CatalogService con DAO inyectado."""
    return CatalogService(catalog_dao)

@pytest.fixture
def app(temp_db):
    """Crea una aplicación Flask configurada para el entorno de test."""
    flask_app = create_app()
    flask_app.config.update({
        "TESTING": True,
        "DEBUG": False,
    })
    return flask_app

@pytest.fixture
def client(app):
    """Cliente de pruebas HTTP de Flask."""
    return app.test_client()

@pytest.fixture
def auth_headers(secret_key):
    """Genera cabecera Authorization Bearer válida simulando un JWT emitido por UserService."""
    now = datetime.now(timezone.utc)
    payload = {
        'sub': "user-test-uuid-1234",
        'role': "proveedor", # Rol simulado
        'exp': now + timedelta(minutes=15),
        'iat': now
    }
    # Encriptamos con la misma clave que usará catalog_routes.py para desencriptar
    token = jwt.encode(payload, secret_key, algorithm=settings.ALGORITHM)
    return {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

@pytest.fixture
def seed_db(temp_db):
    """Inserta datos básicos en la BD temporal para los tests."""
    conn = temp_db["conn"]
    cursor = conn.cursor()
    
    # Insertar Festival mock
    cursor.execute('''
        INSERT INTO Festivales (id_festival, nombre, fecha_inicio, fecha_fin, ubicacion, artistas_destacados)
        VALUES ('fest_test_2026', 'Festival Test', '2026-07-15', '2026-07-18', 'Madrid', '["Daft Punk"]')
    ''')
    
    # Insertar Espacio mock
    cursor.execute('''
        INSERT INTO Espacios (id_espacio, id_festival, tipo, metros_cuadrados, precio_alquiler, estado)
        VALUES ('esp-test-1', 'fest_test_2026', 'foodtruck', 15, 1200.50, 'disponible')
    ''')
    
    # Insertar Tipos de Entrada mock
    cursor.execute('''
        INSERT INTO Tipos_Entrada (id_festival, tipo, precio, disponibles)
        VALUES ('fest_test_2026', 'weekend', 125.00, 100)
    ''')
    
    conn.commit()
    return "fest_test_2026"  # Devolvemos el ID para usarlo en las aserciones de los tests