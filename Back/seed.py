import json
import sqlite3
import os
import sys
import bcrypt # Necesario para generar contraseñas válidas para el login

# Esto permite que Python vea la carpeta 'app' correctamente
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.daos.sqlite_impl.event_dao import EventDAOSQLite
from app.daos.sqlite_impl.merch_dao import MerchDAOSQLite 
from app.daos.sqlite_impl.ticket_price_dao import TicketPriceDAOSQLite

def create_tables(conn):
    cursor = conn.cursor()
    
    # 1. Usuarios (Actualizada para soportar roles)
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

    # 4. Compras de Merch (Historial para MyMerch)
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
    
    # 5. Precios de Tickets (Configuración)
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

    # 6. Tickets Comprados (Wallet para MyTickets)
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

    # 7. Artistas
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS artists (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            genre TEXT,
            image TEXT,
            spotifyUrl TEXT
        )
    """)

    # 8. Relación Eventos - Artistas
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS event_artists (
            event_id TEXT,
            artist_id TEXT,
            PRIMARY KEY (event_id, artist_id),
            FOREIGN KEY (event_id) REFERENCES events (id),
            FOREIGN KEY (artist_id) REFERENCES artists (id)
        )
    """)
    
    conn.commit()
    print("✅ Esquema de base de datos completo verificado.")

def seed_database():
    db_path = os.path.join(os.path.dirname(__file__), 'subsonic.db')
    if os.path.exists(db_path):
        os.remove(db_path)
        
    conn = sqlite3.connect(db_path)
    
    try:
        create_tables(conn)
        cursor = conn.cursor()

        print(f"🌱 Sembrando datos para pruebas integrales...")

        # --- USUARIOS DE PRUEBA ---
        # Password '123456' para todos excepto admin
        pwd_hash = bcrypt.hashpw("123456".encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        admin_hash = bcrypt.hashpw("admin".encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

        users = [
            ('u-admin', 'Administrador Global', 'admin@admin.com', admin_hash, 'admin', None),
            ('u-user', 'Juan Raver', 'user@test.com', pwd_hash, 'user', None),
            ('u-vendor', 'Food Trucks Inc', 'vendor@test.com', pwd_hash, 'vendor', None)
        ]
        cursor.executemany("INSERT INTO users VALUES (?, ?, ?, ?, ?, ?)", users)

        # --- ARTISTAS ---
        artists = [
            ('a1', 'Amelie Lens', 'Techno', 'https://images.unsplash.com/photo-1574672280600-4accfa5b6f98?w=400', 'spotify_url'),
            ('a2', 'Charlotte de Witte', 'Acid Techno', 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=400', 'spotify_url')
        ]
        cursor.executemany("INSERT INTO artists VALUES (?, ?, ?, ?, ?)", artists)

        # --- EVENTOS ---
        event_1 = ('1', 'Subsonic Festival 2026', '2026-07-15 12:00:00', '3 días de Techno.', 
                   'https://images.unsplash.com/photo-1624929303661-22c5bce0169b?w=1080', 
                   json.dumps(['VIP', 'Food']), json.dumps([]), 'map_url')
        cursor.execute("INSERT INTO events VALUES (?, ?, ?, ?, ?, ?, ?, ?)", event_1)

        # --- COMPRAS DE MERCH (Para probar MyMerch del usuario) ---
        merch_purchases = [
            ('p1', 'u-user', 'Subsonic "Acid" T-Shirt', 35.0, 1, 35.0, 
             'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', 'Clothing', 'SHIPPED', '2026-04-01 10:00:00'),
            ('p2', 'u-user', 'LED Bracelet', 12.0, 2, 24.0, 
             'https://images.unsplash.com/photo-1515516089376-88db1e26e9c0?w=400', 'Accessories', 'PENDING', '2026-04-10 15:30:00')
        ]
        cursor.executemany("INSERT INTO merch_purchases VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", merch_purchases)

        # --- TICKETS COMPRADOS (Para probar MyTickets del usuario) ---
        purchased_tickets = [
            ('pt1', 'u-user', 'Subsonic Festival 2026', '2026-07-15', 'VIP Experience', 150.0, 
             'QR_SUB_2026_VIP_001', 'https://images.unsplash.com/photo-1624929303661-22c5bce0169b?w=400', '2026-03-15 09:00:00')
        ]
        cursor.executemany("INSERT INTO purchased_tickets VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", purchased_tickets)

        # --- CATALOGO MERCH ---
        merch_items = [
            ('m1', 'Subsonic "Acid" T-Shirt', 35.0, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', 'Clothing'),
            ('m3', 'LED Bracelet', 12.0, 'https://images.unsplash.com/photo-1515516089376-88db1e26e9c0?w=400', 'Accessories')
        ]
        cursor.executemany("INSERT INTO merchandise_items VALUES (?, ?, ?, ?, ?)", merch_items)

        conn.commit()
        print("🚀 Base de datos lista para pruebas de Login, MyMerch y MyTickets.")

    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    seed_database()