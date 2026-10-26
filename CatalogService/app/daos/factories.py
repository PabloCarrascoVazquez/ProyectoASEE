import os
import sqlite3
import mysql.connector
from mysql.connector import pooling

class DatabaseConnectionFactory:
    _mysql_pool = None
    _sqlite_conn = None
    _sqlite_initialized = False

    @classmethod
    def get_connection(cls):
        engine = os.getenv("DB_ENGINE", "sqlite").lower()

        if engine == "mysql":
            if cls._mysql_pool is None:
                cls._mysql_pool = mysql.connector.pooling.MySQLConnectionPool(
                    pool_name="catalog_pool",
                    pool_size=5,
                    host=os.getenv("DB_HOST", "127.0.0.1"),
                    port=int(os.getenv("DB_PORT", 3306)),
                    database=os.getenv("DB_NAME", "catalogo_db"),
                    user=os.getenv("DB_USER", "root"),
                    password=os.getenv("DB_PASSWORD", "")
                )
            return cls._mysql_pool.get_connection()

        elif engine == "sqlite":
            db_path = os.getenv("SQLITE_DB_PATH")
            if not db_path:
                current_dir = os.path.dirname(os.path.abspath(__file__))
                # Se creará el archivo catalogo.db en la raíz del microservicio
                db_path = os.path.abspath(os.path.join(current_dir, "../../catalogo.db"))

            if cls._sqlite_conn is None:
                conn = sqlite3.connect(db_path, check_same_thread=False)
                conn.row_factory = sqlite3.Row
                # Vital en el catálogo para que funcionen las Claves Foráneas entre Festivales y Espacios
                conn.execute("PRAGMA foreign_keys = ON") 
                cls._sqlite_conn = conn

                if not cls._sqlite_initialized:
                    cls._initialize_sqlite(conn)
                    cls._sqlite_initialized = True

            return cls._sqlite_conn
        else:
            raise ValueError(f"Motor de base de datos no soportado: {engine}")

    @classmethod
    def close_sqlite(cls):
        """Cierra la conexión activa de SQLite si existe."""
        if cls._sqlite_conn is not None:
            try:
                cls._sqlite_conn.close()
            except Exception:
                pass
            cls._sqlite_conn = None
            cls._sqlite_initialized = False

    @classmethod
    def _initialize_sqlite(cls, conn):
        """Inicializa exclusivamente las tablas del microservicio de catálogo."""
        cursor = conn.cursor()
        sql_script = """
        CREATE TABLE IF NOT EXISTS Festivales (
            id_festival VARCHAR(50) PRIMARY KEY,
            nombre VARCHAR(150) NOT NULL,
            fecha_inicio DATE NOT NULL,
            fecha_fin DATE NOT NULL,
            ubicacion VARCHAR(255) NOT NULL,
            artistas_destacados TEXT
        );

        CREATE TABLE IF NOT EXISTS Espacios (
            id_espacio VARCHAR(36) PRIMARY KEY,
            id_festival VARCHAR(50) NOT NULL,
            tipo VARCHAR(50) NOT NULL,
            metros_cuadrados INT NOT NULL,
            precio_alquiler DECIMAL(10, 2) NOT NULL,
            estado VARCHAR(20) NOT NULL DEFAULT 'disponible',
            FOREIGN KEY (id_festival) REFERENCES Festivales(id_festival)
        );

        CREATE TABLE IF NOT EXISTS Alquileres (
            id_contrato VARCHAR(36) PRIMARY KEY,
            id_espacio VARCHAR(36) NOT NULL,
            nombre_negocio VARCHAR(100) NOT NULL,
            tipo_negocio VARCHAR(100) NOT NULL,
            necesita_conexion_electrica BOOLEAN NOT NULL DEFAULT 0,
            estado VARCHAR(50) NOT NULL DEFAULT 'Pendiente de firma',
            fecha_solicitud DATETIME NOT NULL,
            FOREIGN KEY (id_espacio) REFERENCES Espacios(id_espacio)
        );

        CREATE TABLE IF NOT EXISTS Tipos_Entrada (
            id_festival VARCHAR(50) NOT NULL,
            tipo VARCHAR(20) NOT NULL,
            precio DECIMAL(10, 2) NOT NULL,
            disponibles INT NOT NULL DEFAULT 0,
            PRIMARY KEY (id_festival, tipo),
            FOREIGN KEY (id_festival) REFERENCES Festivales(id_festival)
        );

        CREATE TABLE IF NOT EXISTS Artistas_Favoritos (
            user_id VARCHAR(36) NOT NULL,
            id_festival VARCHAR(50) NOT NULL,
            nombre_artista VARCHAR(100) NOT NULL,
            PRIMARY KEY (user_id, id_festival, nombre_artista),
            FOREIGN KEY (id_festival) REFERENCES Festivales(id_festival)
        );
        """
        cursor.executescript(sql_script)
        conn.commit()
        cursor.close()


class DAOFactory:
    """Factoría encargada de instanciar el DAO correspondiente según el motor."""

    @staticmethod
    def get_catalog_dao():
        engine = os.getenv("DB_ENGINE", "sqlite").lower()
        conn = DatabaseConnectionFactory.get_connection()

        if engine == "mysql":
            from app.daos.mysql_impl.catalog_dao import CatalogDAOMySQL
            return CatalogDAOMySQL(conn)
        else:
            from app.daos.sqlite_impl.catalog_dao import CatalogDAOSQLite
            return CatalogDAOSQLite(conn)