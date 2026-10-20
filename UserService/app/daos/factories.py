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
                    pool_name="users_pool",
                    pool_size=5,
                    host=os.getenv("DB_HOST", "127.0.0.1"),
                    port=int(os.getenv("DB_PORT", 3306)),
                    database=os.getenv("DB_NAME", "users_db"),
                    user=os.getenv("DB_USER", "root"),
                    password=os.getenv("DB_PASSWORD", "")
                )
            return cls._mysql_pool.get_connection()

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
        """Inicializa exclusivamente la tabla del microservicio de usuarios."""
        cursor = conn.cursor()
        sql_script = """
        CREATE TABLE IF NOT EXISTS users (
            id VARCHAR(36) PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(150) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            avatar VARCHAR(255),
            rol VARCHAR(20) NOT NULL DEFAULT 'client'
        );
        """
        cursor.executescript(sql_script)
        conn.commit()
        cursor.close()


class DAOFactory:
    """Factoría encargada de instanciar el DAO correspondiente según el motor."""

    @staticmethod
    def get_user_dao():
        engine = os.getenv("DB_ENGINE", "sqlite").lower()
        conn = DatabaseConnectionFactory.get_connection()

        if engine == "mysql":
            from app.daos.mysql_impl.user_dao import UserDAOMySQL
            return UserDAOMySQL(conn)
        else:
            from app.daos.sqlite_impl.user_dao import UserDAOSQLite
            return UserDAOSQLite(conn)
