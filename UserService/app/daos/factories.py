import os
import sqlite3
import psycopg2
from psycopg2 import pool


class DatabaseConnectionFactory:
    _pg_pool = None
    _pg_initialized = False
    _sqlite_conn = None
    _sqlite_initialized = False

    @classmethod
    def get_connection(cls):
        engine = os.getenv("DB_ENGINE", "sqlite").lower()

        if engine in ("postgres", "postgresql"):
         if cls._pg_pool is None or cls._pg_pool.closed:
             conn = psycopg2.connect(
                 host=os.getenv("DB_HOST", "127.0.0.1"),
                 port=int(os.getenv("DB_PORT", 5432)),
                 dbname=os.getenv("DB_NAME", "users_db"),
                 user=os.getenv("DB_USER", "subsonic"),
                 password=os.getenv("DB_PASSWORD", "subsonic123")
             )
             cls._pg_pool = conn
             if not cls._pg_initialized:
                 cls._initialize_postgres(conn)
                 cls._pg_initialized = True
         return cls._pg_pool

        elif engine == "sqlite":
            db_path = os.getenv("SQLITE_DB_PATH")
            if not db_path:
                current_dir = os.path.dirname(os.path.abspath(__file__))
                db_path = os.path.abspath(os.path.join(current_dir, "../../users.db"))

            if cls._sqlite_conn is None:
                conn = sqlite3.connect(db_path, check_same_thread=False)
                conn.row_factory = sqlite3.Row
                conn.execute("PRAGMA foreign_keys = ON")
                cls._sqlite_conn = conn

                if not cls._sqlite_initialized:
                    cls._initialize_sqlite(conn)
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
    def _initialize_postgres(cls, conn):
        """Inicializa la tabla de usuarios y siembra el usuario Admin por defecto en PostgreSQL."""
        import bcrypt

        cursor = conn.cursor()
        try:
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id VARCHAR(36) PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(150) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                avatar VARCHAR(255),
                rol VARCHAR(20) NOT NULL DEFAULT 'client'
            );
            """)

            cursor.execute("SELECT id FROM users WHERE email = %s", ("admin@subsonic.com",))
            if not cursor.fetchone():
                admin_password = "admin123"
                hashed_pw = bcrypt.hashpw(admin_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

                cursor.execute("""
                    INSERT INTO users (id, name, email, password_hash, avatar, rol)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """, (
                    "00000000-0000-0000-0000-000000000001",
                    "Administrador Subsonic",
                    "admin@subsonic.com",
                    hashed_pw,
                    "https://bucket.com/avatars/admin.png",
                    "admin"
                ))
            conn.commit()
        except Exception as err:
            conn.rollback()
            raise err
        finally:
            cursor.close()

    @classmethod
    def _initialize_sqlite(cls, conn):
        """Inicializa la tabla de usuarios y siembra el usuario Admin por defecto."""
        import bcrypt

        cursor = conn.cursor()

        cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id VARCHAR(36) PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(150) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            avatar VARCHAR(255),
            rol VARCHAR(20) NOT NULL DEFAULT 'client'
        );
        """)

        cursor.execute("SELECT id FROM users WHERE email = ?", ("admin@subsonic.com",))
        if not cursor.fetchone():
            admin_password = "admin123"
            hashed_pw = bcrypt.hashpw(admin_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

            cursor.execute("""
                INSERT INTO users (id, name, email, password_hash, avatar, rol)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                "00000000-0000-0000-0000-000000000001",
                "Administrador Subsonic",
                "admin@subsonic.com",
                hashed_pw,
                "https://bucket.com/avatars/admin.png",
                "admin"
            ))
            conn.commit()

        cursor.close()


class DAOFactory:
    """Factoría encargada de instanciar el DAO correspondiente según el motor."""

    @staticmethod
    def get_user_dao():
        engine = os.getenv("DB_ENGINE", "sqlite").lower()
        conn = DatabaseConnectionFactory.get_connection()

        if engine in ("postgres", "postgresql"):
            from app.daos.postgres_impl.user_dao import UserDAOPostgres
            return UserDAOPostgres(conn)
        else:
            from app.daos.sqlite_impl.user_dao import UserDAOSQLite
            return UserDAOSQLite(conn)