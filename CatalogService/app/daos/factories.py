import os
import sys
import sqlite3

try:
    import psycopg2
    from psycopg2 import pool
except ImportError:
    psycopg2 = None

SCHEMA_SQLITE = """
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

CREATE TABLE IF NOT EXISTS Artistas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre VARCHAR(100) NOT NULL,
    genero VARCHAR(50),
    popularidad INT DEFAULT 0
);
"""

SCHEMA_POSTGRES = [
    """
    CREATE TABLE IF NOT EXISTS festivales (
        id_festival VARCHAR(50) PRIMARY KEY,
        nombre VARCHAR(150) NOT NULL,
        fecha_inicio DATE NOT NULL,
        fecha_fin DATE NOT NULL,
        ubicacion VARCHAR(255) NOT NULL,
        artistas_destacados TEXT
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS espacios (
        id_espacio VARCHAR(36) PRIMARY KEY,
        id_festival VARCHAR(50) NOT NULL REFERENCES festivales(id_festival) ON DELETE CASCADE,
        tipo VARCHAR(50) NOT NULL,
        metros_cuadrados INT NOT NULL,
        precio_alquiler DECIMAL(10, 2) NOT NULL,
        estado VARCHAR(20) NOT NULL DEFAULT 'disponible'
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS alquileres (
        id_contrato VARCHAR(36) PRIMARY KEY,
        id_espacio VARCHAR(36) NOT NULL REFERENCES espacios(id_espacio) ON DELETE CASCADE,
        nombre_negocio VARCHAR(100) NOT NULL,
        tipo_negocio VARCHAR(100) NOT NULL,
        necesita_conexion_electrica BOOLEAN NOT NULL DEFAULT FALSE,
        estado VARCHAR(50) NOT NULL DEFAULT 'Pendiente de firma',
        fecha_solicitud TIMESTAMP NOT NULL
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS tipos_entrada (
        id_festival VARCHAR(50) NOT NULL REFERENCES festivales(id_festival) ON DELETE CASCADE,
        tipo VARCHAR(20) NOT NULL,
        precio DECIMAL(10, 2) NOT NULL,
        disponibles INT NOT NULL DEFAULT 0,
        PRIMARY KEY (id_festival, tipo)
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS artistas_favoritos (
        user_id VARCHAR(36) NOT NULL,
        id_festival VARCHAR(50) NOT NULL REFERENCES festivales(id_festival) ON DELETE CASCADE,
        nombre_artista VARCHAR(100) NOT NULL,
        PRIMARY KEY (user_id, id_festival, nombre_artista)
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS artistas (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        genero VARCHAR(50),
        popularidad INT DEFAULT 0
    );
    """
]

SEED_DATA = {
    "festivales": [
        (
            "fest_subsonic_2026",
            "Subsonic Festival 2026",
            "2026-07-15",
            "2026-07-18",
            "Recinto Ferial, Madrid",
            '["Daft Punk", "Carl Cox", "Peggy Gou", "The Chemical Brothers", "Rosalia"]'
        ),
        (
            "fest_subsonic_winter_2026",
            "Subsonic Winter Fest 2026",
            "2026-12-05",
            "2026-12-07",
            "Palacio Vistalegre, Madrid",
            '["Amelie Lens", "Boris Brejcha", "Tale Of Us", "Solomun"]'
        )
    ],
    "tipos_entrada": [
        ("fest_subsonic_2026", "day", 60.00, 300),
        ("fest_subsonic_2026", "weekend", 125.00, 450),
        ("fest_subsonic_2026", "vip", 250.00, 100),
        ("fest_subsonic_winter_2026", "day", 50.00, 200),
        ("fest_subsonic_winter_2026", "weekend", 95.00, 350),
        ("fest_subsonic_winter_2026", "vip", 180.00, 50)
    ],
    "espacios": [
        ("esp-4920-8439", "fest_subsonic_2026", "foodtruck", 15, 1200.50, "disponible"),
        ("esp-4920-8440", "fest_subsonic_2026", "mercadillo", 25, 850.00, "disponible"),
        ("esp-4920-8441", "fest_subsonic_2026", "vip_zone", 50, 3500.00, "disponible"),
        ("esp-4920-8442", "fest_subsonic_2026", "foodtruck", 20, 1500.00, "alquilado"),
        ("esp-4920-8443", "fest_subsonic_winter_2026", "foodtruck", 12, 950.00, "disponible"),
        ("esp-4920-8444", "fest_subsonic_winter_2026", "mercadillo", 20, 700.00, "disponible")
    ],
    "alquileres": [
        ("alq-1001-2026", "esp-4920-8442", "Burger Master Foodtruck", "Restauración", True, "Confirmado", "2026-06-01 10:00:00")
    ],
    "artistas": [
        ("Daft Punk", "Electronic / French House", 100),
        ("Carl Cox", "Techno", 98),
        ("Peggy Gou", "House / Techno", 95),
        ("The Chemical Brothers", "Big Beat / Electronic", 94),
        ("Amelie Lens", "Acid Techno", 92),
        ("Boris Brejcha", "High-Tech Minimal", 90)
    ],
    "artistas_favoritos": [
        ("0afb22d5-69c8-4d5e-93ad-492a5f6bd2d0", "fest_subsonic_2026", "Daft Punk"),
        ("0afb22d5-69c8-4d5e-93ad-492a5f6bd2d0", "fest_subsonic_2026", "Peggy Gou")
    ]
}


class DatabaseConnectionFactory:
    _pg_pool = None
    _pg_initialized = False
    _sqlite_conn = None
    _sqlite_initialized = False

    @classmethod
    def _is_test_env(cls) -> bool:
        """Detecta si la aplicación se está ejecutando en entorno de pruebas unitarias (pytest)."""
        if "pytest" in sys.modules:
            return True
        if os.getenv("TESTING") == "True":
            return True
        if os.getenv("PYTEST_CURRENT_TEST") is not None:
            return True
        return False

    @classmethod
    def get_connection(cls):
        engine = os.getenv("DB_ENGINE", "sqlite").lower()

        if engine in ("postgres", "postgresql"):
         if cls._pg_pool is None or cls._pg_pool.closed:
             conn = psycopg2.connect(
                 host=os.getenv("DB_HOST", "127.0.0.1"),
                 port=int(os.getenv("DB_PORT", 5432)),
                 dbname=os.getenv("DB_NAME", "catalogo_db"),
                 user=os.getenv("DB_USER", "subsonic"),
                 password=os.getenv("DB_PASSWORD", "subsonic123")
             )
             cls._pg_pool = conn
             if not cls._pg_initialized:
                 cls._initialize_postgres(conn)
                 if not cls._is_test_env():
                     cls.seed_sample_data(conn, "postgres")
                 cls._pg_initialized = True
         return cls._pg_pool

        elif engine == "sqlite":
            db_path = os.getenv("SQLITE_DB_PATH")
            if not db_path:
                current_dir = os.path.dirname(os.path.abspath(__file__))
                db_path = os.path.abspath(os.path.join(current_dir, "../../catalogo.db"))

            if cls._sqlite_conn is None:
                conn = sqlite3.connect(db_path, check_same_thread=False)
                conn.row_factory = sqlite3.Row
                conn.execute("PRAGMA foreign_keys = ON")
                cls._sqlite_conn = conn

                if not cls._sqlite_initialized:
                    cls._initialize_sqlite(conn)
                    if not cls._is_test_env():
                        cls.seed_sample_data(conn, "sqlite")
                    cls._sqlite_initialized = True

            return cls._sqlite_conn
        else:
            raise ValueError(f"Motor de base de datos no soportado: {engine}")

    @classmethod
    def release_postgres_connection(cls, conn):
        """Devuelve la conexión al pool de PostgreSQL."""
        if cls._pg_pool is not None and conn is not None:
            cls._pg_pool.putconn(conn)

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
        """Inicializa exclusivamente las tablas del microservicio de catálogo en SQLite."""
        cursor = conn.cursor()
        cursor.executescript(SCHEMA_SQLITE)
        conn.commit()
        cursor.close()

    @classmethod
    def _initialize_postgres(cls, conn):
        """Inicializa exclusivamente las tablas del microservicio de catálogo en PostgreSQL."""
        cursor = conn.cursor()
        try:
            for statement in SCHEMA_POSTGRES:
                cursor.execute(statement)
            conn.commit()
        except Exception as err:
            conn.rollback()
            raise err
        finally:
            cursor.close()

    @classmethod
    def seed_sample_data(cls, conn, engine: str, force: bool = False):
        """
        Inserta datos semilla si las tablas del catálogo están vacías (o si force=True).
        Compatible con SQLite y PostgreSQL.
        """
        cursor = conn.cursor()
        try:
            cursor.execute("SELECT COUNT(*) FROM festivales")
            row = cursor.fetchone()
            count = row[0] if row else 0

            if count > 0 and not force:
                return

            is_sqlite = (engine == "sqlite")
            placeholder = "?" if is_sqlite else "%s"
            insert_prefix = "INSERT OR IGNORE INTO" if is_sqlite else "INSERT INTO"
            conflict_suffix = "" if is_sqlite else "ON CONFLICT DO NOTHING"

            # 1. Festivales
            for fest in SEED_DATA["festivales"]:
                query = f"""
                    {insert_prefix} festivales (id_festival, nombre, fecha_inicio, fecha_fin, ubicacion, artistas_destacados)
                    VALUES ({placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder})
                    {conflict_suffix}
                """
                cursor.execute(query, fest)

            # 2. Tipos de Entrada
            for entrada in SEED_DATA["tipos_entrada"]:
                query = f"""
                    {insert_prefix} tipos_entrada (id_festival, tipo, precio, disponibles)
                    VALUES ({placeholder}, {placeholder}, {placeholder}, {placeholder})
                    {conflict_suffix}
                """
                cursor.execute(query, entrada)

            # 3. Espacios
            for espacio in SEED_DATA["espacios"]:
                query = f"""
                    {insert_prefix} espacios (id_espacio, id_festival, tipo, metros_cuadrados, precio_alquiler, estado)
                    VALUES ({placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder})
                    {conflict_suffix}
                """
                cursor.execute(query, espacio)

            # 4. Alquileres
            for alq in SEED_DATA["alquileres"]:
                query = f"""
                    {insert_prefix} alquileres (id_contrato, id_espacio, nombre_negocio, tipo_negocio, necesita_conexion_electrica, estado, fecha_solicitud)
                    VALUES ({placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder}, {placeholder})
                    {conflict_suffix}
                """
                cursor.execute(query, alq)

            # 5. Artistas
            for artista in SEED_DATA["artistas"]:
                query = f"""
                    {insert_prefix} artistas (nombre, genero, popularidad)
                    VALUES ({placeholder}, {placeholder}, {placeholder})
                    {conflict_suffix}
                """
                cursor.execute(query, artista)

            # 6. Artistas Favoritos
            for fav in SEED_DATA["artistas_favoritos"]:
                query = f"""
                    {insert_prefix} artistas_favoritos (user_id, id_festival, nombre_artista)
                    VALUES ({placeholder}, {placeholder}, {placeholder})
                    {conflict_suffix}
                """
                cursor.execute(query, fav)

            conn.commit()
            print("✅ Base de datos de Catálogo poblada exitosamente con datos semilla.")
        except Exception as e:
            conn.rollback()
            print(f"⚠️ Error al poblar datos semilla en Catálogo: {e}")
        finally:
            cursor.close()


class DAOFactory:
    """Factoría encargada de instanciar el DAO correspondiente según el motor."""

    @staticmethod
    def get_catalog_dao():
        engine = os.getenv("DB_ENGINE", "sqlite").lower()
        conn = DatabaseConnectionFactory.get_connection()

        if engine in ("postgres", "postgresql"):
            from app.daos.postgres_impl.catalog_dao import CatalogDAOPostgres
            return CatalogDAOPostgres(conn)
        else:
            from app.daos.sqlite_impl.catalog_dao import CatalogDAOSQLite
            return CatalogDAOSQLite(conn)
