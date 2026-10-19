import os
import sqlite3
import mysql.connector
from mysql.connector import pooling


class DatabaseConnectionFactory:
    _mysql_pool = None
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
            current_dir = os.path.dirname(os.path.abspath(__file__))
            db_path = os.path.abspath(os.path.join(current_dir, "../../users.db"))
            conn = sqlite3.connect(db_path, check_same_thread=False)
            conn.execute("PRAGMA foreign_keys = ON")
            
            if not cls._sqlite_initialized:
                cls._initialize_sqlite(conn)
                cls._sqlite_initialized = True
            return conn
        else:
            raise ValueError(f"Motor de base de datos no soportado: {engine}")

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
            rol VARCHAR(20) NOT NULL DEFAULT 'client',

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