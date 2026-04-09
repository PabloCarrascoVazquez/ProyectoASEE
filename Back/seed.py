import json
import sqlite3
import os
import sys

# Esto permite que Python vea la carpeta 'app' correctamente
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.daos.sqlite_impl.event_dao import EventDAOSQLite
from app.daos.sqlite_impl.merch_dao import MerchDAOSQLite 
from app.daos.sqlite_impl.ticket_price_dao import TicketPriceDAOSQLite

def create_tables(conn):
    cursor = conn.cursor()
    
    # 1. Eventos
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
    
    # 2. Merchandising
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS merchandise_items (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            price REAL,
            image TEXT,
            category TEXT
        )
    """)
    
    # 3. Tickets
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

    # 4. Artistas (Nueva)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS artists (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            genre TEXT,
            image TEXT,
            spotifyUrl TEXT
        )
    """)

    # 5. Relación Eventos - Artistas (Mucha a Muchos)
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
    print("✅ Tablas verificadas/creadas (incluyendo Artistas).")

def seed_database():
    db_path = os.path.join(os.path.dirname(__file__), 'subsonic.db')
    # Borramos la DB anterior para evitar conflictos de IDs duplicados al re-ejecutar
    if os.path.exists(db_path):
        os.remove(db_path)
        
    conn = sqlite3.connect(db_path)
    
    try:
        create_tables(conn)
        cursor = conn.cursor()
        
        event_dao = EventDAOSQLite(conn)
        merch_dao = MerchDAOSQLite(conn)
        ticket_dao = TicketPriceDAOSQLite(conn)

        print(f"🌱 Poblando base de datos con contenido premium...")

        # --- ARTISTAS ---
        artists = [
            ('a1', 'Amelie Lens', 'Techno', 'https://images.unsplash.com/photo-1574672280600-4accfa5b6f98?w=400', 'https://spotify.com/amelie'),
            ('a2', 'Charlotte de Witte', 'Acid Techno', 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=400', 'https://spotify.com/charlotte'),
            ('a3', 'Boris Brejcha', 'High-Tech Minimal', 'https://images.unsplash.com/photo-1598387181032-a3103a2db5b3?w=400', 'https://spotify.com/boris'),
            ('a4', 'Carl Cox', 'House / Techno', 'https://images.unsplash.com/photo-1514525253361-bee8d48d0b2b?w=400', 'https://spotify.com/carl')
        ]
        cursor.executemany("INSERT INTO artists VALUES (?, ?, ?, ?, ?)", artists)

        # --- EVENTOS ---
        event_1 = {
            'id': '1', 'name': 'Subsonic Festival 2026', 'date': '2026-07-15 12:00:00',
            'image': 'https://images.unsplash.com/photo-1624929303661-22c5bce0169b?w=1080',
            'description': '3 días de inmersión total en el desierto con lo mejor del Techno mundial.',
            'services': json.dumps(['Vip Lounges', 'Camping', 'Shuttle Bus', 'Food Court']),
            'gallery': json.dumps([]), 'mapImage': 'https://images.unsplash.com/photo-1516037172336-512c4aa6b16a?w=1200'
        }
        event_2 = {
            'id': '2', 'name': 'Techno Warehouse Session', 'date': '2026-09-20 23:00:00',
            'image': 'https://images.unsplash.com/photo-1571266028243-e4bb33394c9a?w=1080',
            'description': 'Evento underground en una nave industrial abandonada en las afueras.',
            'services': json.dumps(['Cloakroom', 'Vegan Options']),
            'gallery': json.dumps([]), 'mapImage': ''
        }
        event_dao.create(event_1)
        event_dao.create(event_2)

        # --- VINCULAR ARTISTAS A EVENTOS ---
        # Festival 2026 tiene a todos
        links = [('1', 'a1'), ('1', 'a2'), ('1', 'a3'), ('1', 'a4'), ('2', 'a3')]
        cursor.executemany("INSERT INTO event_artists VALUES (?, ?)", links)

        # --- TICKETS ---
        tickets = [
            ('t1', '1', 'General Pass', 85.0, 'Acceso a los 3 días', json.dumps(['Water stations', 'Main Stage'])),
            ('t2', '1', 'VIP Experience', 150.0, 'Acceso preferente y zonas relax', json.dumps(['Fast Track', 'VIP Bars', 'Gift Bag'])),
            ('t3', '2', 'Early Bird', 25.0, 'Entrada reducida por tiempo limitado', json.dumps(['1 Drink included']))
        ]
        for t in tickets:
            cursor.execute("INSERT INTO ticket_prices VALUES (?, ?, ?, ?, ?, ?)", t)

        # --- MERCHANDISING ---
        merch = [
            ('m1', 'Subsonic "Acid" T-Shirt', 35.0, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', 'Clothing'),
            ('m2', 'Subsonic Logo Hoodie', 55.0, 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400', 'Clothing'),
            ('m3', 'LED Bracelet', 12.0, 'https://images.unsplash.com/photo-1515516089376-88db1e26e9c0?w=400', 'Accessories'),
            ('m4', 'Festival Cap', 25.0, 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400', 'Accessories')
        ]
        for m in merch:
            cursor.execute("INSERT INTO merchandise_items (id, name, price, image, category) VALUES (?, ?, ?, ?, ?)", m)

        conn.commit()
        print("🚀 ¡Todo listo! Base de datos rica en contenido preparada.")

    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    seed_database()