import json
import sqlite3
import os
import sys
import bcrypt

# Configuración de rutas para que Python encuentre el paquete 'app'
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Importación de DAOs
from app.daos.sqlite_impl.event_dao import EventDAOSQLite
from app.daos.sqlite_impl.merch_dao import MerchDAOSQLite 
from app.daos.sqlite_impl.ticket_price_dao import TicketPriceDAOSQLite
from app.daos.sqlite_impl.user_dao import UserDAOSQLite
from app.daos.sqlite_impl.user_merch_dao import UserMerchDAOSQLite

def create_tables(conn):
    """Crea exclusivamente el esquema de tablas."""
    cursor = conn.cursor()
    
    # 1. Usuarios
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'user',
            avatar TEXT
        )
    """)

    # 2. Eventos
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS events (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            date TEXT,
            description TEXT,
            image TEXT,
            services TEXT,
            gallery TEXT,
            mapImage TEXT
        )
    """)
    
    # 3. Merchandising (Catálogo)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS merchandise_items (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            price REAL,
            image TEXT,
            category TEXT
        )
    """)

    # 4. Compras de Merch (Historial)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS merch_purchases (
            id TEXT PRIMARY KEY,
            user_id TEXT,
            product_name TEXT,
            price_at_purchase REAL,
            quantity INTEGER,
            total_price REAL,
            image TEXT,
            category TEXT,
            status TEXT,
            purchase_date TEXT,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    """)
    
    # 5. Precios de Tickets
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS ticket_prices (
            id TEXT PRIMARY KEY,
            event_id TEXT,
            type TEXT,
            price REAL,
            description TEXT,
            features TEXT,
            FOREIGN KEY (event_id) REFERENCES events (id)
        )
    """)

    # 6. Tickets Comprados (Wallet)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS purchased_tickets (
            id TEXT PRIMARY KEY,
            user_id TEXT,
            event_name TEXT,
            event_date TEXT,
            type TEXT,
            price REAL,
            qr_code TEXT,
            image_url TEXT,
            purchase_date TEXT,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    """)

    # 7. Artistas y 8. Relaciones
    cursor.execute("CREATE TABLE IF NOT EXISTS artists (id TEXT PRIMARY KEY, name TEXT, genre TEXT, image TEXT, spotifyUrl TEXT)")
    cursor.execute("CREATE TABLE IF NOT EXISTS event_artists (event_id TEXT, artist_id TEXT, PRIMARY KEY(event_id, artist_id))")
    
    conn.commit()

def seed_database():
    db_path = os.path.join(os.path.dirname(__file__), 'subsonic.db')
    if os.path.exists(db_path):
        os.remove(db_path)
        
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    
    try:
        # Primero creamos la estructura
        create_tables(conn)
        
        # Ahora instanciamos los DAOs para insertar los datos
        user_dao = UserDAOSQLite(conn)
        event_dao = EventDAOSQLite(conn)
        merch_dao = MerchDAOSQLite(conn)
        price_dao = TicketPriceDAOSQLite(conn)
        user_merch_dao = UserMerchDAOSQLite(conn)

        print(f"🌱 Poblando base de datos usando DAOs...")

        # --- 1. USUARIOS ---
        def get_hash(pw): return bcrypt.hashpw(pw.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        user_dao.create({
            'id': 'u-user', 'name': 'Juan Raver', 'email': 'user@test.com',
            'password_hash': get_hash('123456'), 'role': 'user'
        })
        user_dao.create({
            'id': 'u-admin', 'name': 'Admin Subsonic', 'email': 'admin@admin.com',
            'password_hash': get_hash('admin'), 'role': 'admin'
        })

        # --- 2. EVENTOS ---
        event_dao.create({
            'id': '1', 'name': 'Subsonic Festival 2026', 'date': '2026-07-15 12:00:00',
            'description': 'Inmersión total Techno.', 'image': 'https://images.unsplash.com/photo-1624929303661-22c5bce0169b',
            'services': ['VIP', 'Camping'], 'gallery': [], 'mapImage': 'map_url'
        })

        # --- 3. CATALOGO MERCH ---
        merch_dao.create({
            'id': 'm1', 'name': 'Subsonic "Acid" T-Shirt', 'price': 35.0,
            'image': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab', 'category': 'Clothing'
        })

        # --- 4. COMPRAS (Historial usando el DAO) ---
        user_merch_dao.create({
            'id': 'p1',
            'user_id': 'u-user',
            'product_name': 'Subsonic "Acid" T-Shirt',
            'price_at_purchase': 35.0,
            'quantity': 1,
            'total_price': 35.0,
            'image': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab',
            'category': 'Clothing',
            'status': 'SHIPPED',
            'purchase_date': '2026-04-01 10:00:00'
        })

        # --- 5. PRECIOS DE TICKETS ---
        price_dao.create({
            'id': 't1', 'event_id': '1', 'type': 'General Pass', 
            'price': 85.0, 'description': 'Acceso 3 días', 'features': ['Water']
        })

        # --- 6. TICKETS COMPRADOS (Directo a tabla) ---
        conn.execute("INSERT INTO purchased_tickets VALUES (?,?,?,?,?,?,?,?,?)", 
            ('pt1', 'u-user', 'Subsonic Festival 2026', '2026-07-15', 'VIP Experience', 150.0, 
             'QR_SUB_2026_001', 'https://images.unsplash.com/photo-1624929303661-22c5bce0169b', '2026-03-15'))

        conn.commit()
        print("🚀 Base de datos poblada con éxito a través de DAOs.")

    except Exception as e:
        print(f"❌ Error en el Seed: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    seed_database()