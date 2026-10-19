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
                    pool_name="subsonic_pool",
                    pool_size=10,
                    host=os.getenv("DB_HOST", "127.0.0.1"),
                    port=int(os.getenv("DB_PORT", 3306)),
                    database=os.getenv("DB_NAME", "subsonic_db"),
                    user=os.getenv("DB_USER", "root"),
                    password=os.getenv("DB_PASSWORD", "")
                )
            return cls._mysql_pool.get_connection()

        elif engine == "sqlite":
            # Usamos una ruta absoluta para que los tests encuentren la DB siempre
            current_dir = os.path.dirname(os.path.abspath(__file__))
            db_path = os.path.abspath(os.path.join(current_dir, "../../subsonic.db"))
            conn = sqlite3.connect(db_path, check_same_thread=False)
            conn.execute("PRAGMA foreign_keys = ON")
            
            if not cls._sqlite_initialized:
                cls._initialize_sqlite(conn)
                cls._sqlite_initialized = True
            return conn
        else:
            raise ValueError(f"❌ Motor de base de datos no soportado: {engine}")

    @classmethod
    def _initialize_sqlite(cls, conn):
        cursor = conn.cursor()
        sql_script = """
        CREATE TABLE IF NOT EXISTS users (id VARCHAR(36) PRIMARY KEY, name VARCHAR(100) NOT NULL, email VARCHAR(100) UNIQUE NOT NULL, password_hash VARCHAR(255) NOT NULL, role VARCHAR(20) NOT NULL DEFAULT 'user', avatar VARCHAR(255));
        CREATE TABLE IF NOT EXISTS events (id VARCHAR(36) PRIMARY KEY, name VARCHAR(100) NOT NULL, date DATETIME NOT NULL, description TEXT NOT NULL, image VARCHAR(255), services TEXT, gallery TEXT, mapImage VARCHAR(255));
        CREATE TABLE IF NOT EXISTS artists (id VARCHAR(36) PRIMARY KEY, name VARCHAR(100) NOT NULL, genre VARCHAR(50) NOT NULL, image VARCHAR(255), spotifyUrl VARCHAR(255));
        CREATE TABLE IF NOT EXISTS event_artists (event_id VARCHAR(36), artist_id VARCHAR(36), PRIMARY KEY (event_id, artist_id), FOREIGN KEY (event_id) REFERENCES events(id), FOREIGN KEY (artist_id) REFERENCES artists(id));
        CREATE TABLE IF NOT EXISTS ticket_prices (id VARCHAR(36) PRIMARY KEY, event_id VARCHAR(36) NOT NULL, type VARCHAR(50) NOT NULL, price REAL NOT NULL, description TEXT, features TEXT, FOREIGN KEY (event_id) REFERENCES events(id));
        CREATE TABLE IF NOT EXISTS user_tickets (id VARCHAR(36) PRIMARY KEY, user_id VARCHAR(36) NOT NULL, ticket_price_id VARCHAR(36) NOT NULL, status VARCHAR(20) DEFAULT 'ACTIVE', purchase_date DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES users(id), FOREIGN KEY (ticket_price_id) REFERENCES ticket_prices(id));
        CREATE TABLE IF NOT EXISTS merchandise_items (id VARCHAR(36) PRIMARY KEY, name VARCHAR(100) NOT NULL, price REAL NOT NULL, image VARCHAR(255), category VARCHAR(50) NOT NULL);
        CREATE TABLE IF NOT EXISTS vendor_spaces (id VARCHAR(36) PRIMARY KEY, event_id VARCHAR(36) NOT NULL, name VARCHAR(100) NOT NULL, available BOOLEAN DEFAULT 1, services TEXT, FOREIGN KEY (event_id) REFERENCES events(id));
        """
        cursor.executescript(sql_script)
        conn.commit()
        cursor.close()

class DAOFactory:
    @staticmethod
    def get_user_dao():
        engine = os.getenv("DB_ENGINE", "sqlite").lower()
        conn = DatabaseConnectionFactory.get_connection()
        if engine == "mysql":
            from app.dao.mysql_impl.user_dao import UserDAOMySQL
            return UserDAOMySQL(conn)
        else:
            from app.dao.sqlite_impl.user_dao import UserDAOSQLite
            return UserDAOSQLite(conn)

    @staticmethod
    def get_event_dao():
        engine = os.getenv("DB_ENGINE", "sqlite").lower()
        conn = DatabaseConnectionFactory.get_connection()
        if engine == "mysql":
            from app.daos.mysql_impl.event_dao import EventDAOMySQL
            return EventDAOMySQL(conn)
        else:
            from app.daos.sqlite_impl.event_dao import EventDAOSQLite
            return EventDAOSQLite(conn)

    @staticmethod
    def get_artist_dao():
        engine = os.getenv("DB_ENGINE", "sqlite").lower()
        conn = DatabaseConnectionFactory.get_connection()
        if engine == "mysql":
            from app.daos.mysql_impl.artist_dao import ArtistDAOMySQL
            return ArtistDAOMySQL(conn)
        else:
            from app.daos.sqlite_impl.artist_dao import ArtistDAOSQLite
            return ArtistDAOSQLite(conn)

    @staticmethod
    def get_ticket_price_dao():
        engine = os.getenv("DB_ENGINE", "sqlite").lower()
        conn = DatabaseConnectionFactory.get_connection()
        if engine == "mysql":
            from app.daos.mysql_impl.ticket_price_dao import TicketPriceDAOMySQL
            return TicketPriceDAOMySQL(conn)
        else:
            from app.daos.sqlite_impl.ticket_price_dao import TicketPriceDAOSQLite
            return TicketPriceDAOSQLite(conn)

    @staticmethod
    def get_vendor_space_dao():
        engine = os.getenv("DB_ENGINE", "sqlite").lower()
        conn = DatabaseConnectionFactory.get_connection()
        if engine == "mysql":
            from app.daos.mysql_impl.vendor_spaces_dao import VendorSpaceDAOMySQL
            return VendorSpaceDAOMySQL(conn)
        else:
            from app.daos.sqlite_impl.vendor_spaces_dao import VendorSpaceDAOSQLite
            return VendorSpaceDAOSQLite(conn)

    @staticmethod
    def get_user_ticket_dao():
        engine = os.getenv("DB_ENGINE", "sqlite").lower()
        conn = DatabaseConnectionFactory.get_connection()
        if engine == "mysql":
            from app.dao.mysql_impl.user_ticket_dao import UserTicketDAOMySQL
            return UserTicketDAOMySQL(conn)
        else:
            from app.dao.sqlite_impl.user_ticket_dao import UserTicketDAOSQLite
            return UserTicketDAOSQLite(conn)

    @staticmethod
    def get_merch_dao():
        engine = os.getenv("DB_ENGINE", "sqlite").lower()
        conn = DatabaseConnectionFactory.get_connection()
        if engine == "mysql":
            from app.daos.mysql_impl.merch_dao import MerchDAOMySQL
            return MerchDAOMySQL(conn)
        else:
            from app.daos.sqlite_impl.merch_dao import MerchDAOSQLite
            return MerchDAOSQLite(conn)
        
    @staticmethod
    def get_user_merch_dao():
        engine = os.getenv("DB_ENGINE", "sqlite").lower()
        conn = DatabaseConnectionFactory.get_connection()
        if engine == "mysql":
            from app.dao.mysql_impl.user_merch_dao import UserMerchDAOMySQL
            return UserMerchDAOMySQL(conn)
        else:
            from app.dao.sqlite_impl.user_merch_dao import UserMerchDAOSQLite
            return UserMerchDAOSQLite(conn)