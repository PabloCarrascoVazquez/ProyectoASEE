import os
import tempfile
import sqlite3
import pytest
from app import create_app
from app.daos.factories import DatabaseConnectionFactory, DAOFactory
from app.daos.sqlite_impl.user_dao import UserDAOSQLite
from app.services.user_service import UserService
from app.services.auth_service import AuthService
from app.dtos.requests import UserRegisterRequest


@pytest.fixture(scope="session")
def secret_key():
    return "test-super-secret-key-12345"


@pytest.fixture
def temp_db():
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
def user_dao(temp_db):
    """Instancia de UserDAOSQLite conectada a la BD de pruebas."""
    return UserDAOSQLite(temp_db["conn"])


@pytest.fixture
def user_service(user_dao):
    """Instancia de UserService con DAO inyectado."""
    return UserService(user_dao)


@pytest.fixture
def auth_service(user_dao):
    """Instancia de AuthService con DAO inyectado."""
    return AuthService(user_dao)


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
def sample_user_data():
    return {
        "name": "Laura Gómez",
        "email": "laura@subsonic.com",
        "password": "Password123!",
        "avatar": "https://bucket.com/avatars/laura.png",
        "rol": "client"
    }


@pytest.fixture
def registered_user(user_service, sample_user_data):
    """Registra un usuario en la BD de pruebas y devuelve su UserProfileResponse."""
    req = UserRegisterRequest(
        name=sample_user_data["name"],
        email=sample_user_data["email"],
        password=sample_user_data["password"],
        avatar=sample_user_data["avatar"],
        rol=sample_user_data["rol"]
    )
    return user_service.register_user(req)


@pytest.fixture
def auth_headers(registered_user, auth_service):
    """Genera cabecera Authorization Bearer válida para el usuario registrado."""
    token = auth_service.generate_token(registered_user.id, registered_user.rol)
    return {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

