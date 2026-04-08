import json
import sqlite3
import os
import sys

# Esto permite que Python vea la carpeta 'app' correctamente
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.daos.sqlite_impl.event_dao import EventDAOSQLite
# Asegúrate de que estos nombres de clase coincidan con tus archivos
from app.daos.sqlite_impl.merch_dao import MerchDAOSQLite 
from app.daos.sqlite_impl.ticket_price_dao import TicketPriceDAOSQLite

def create_tables(conn):
    cursor = conn.cursor()
    # 1. Tabla de Eventos (Esta parece estar bien)
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
    
    # 2. Tabla de Merchandising (CAMBIADA A merchandise_items)
    # También asegúrate de que los nombres de columnas (name, price, etc.) 
    # sean los que tu MerchDAO usa en su método create.
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS merchandise_items (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            price REAL,
            image TEXT,
            category TEXT
        )
    """)
    
    # 3. Tabla de Tickets
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
    conn.commit()
    print("✅ Tablas verificadas/creadas con los nombres correctos.")

def seed_database():
    db_path = os.path.join(os.path.dirname(__file__), 'subsonic.db')
    conn = sqlite3.connect(db_path)
    
    try:
        # 1. Crear las tablas primero
        create_tables(conn)
        
        # 2. Instanciar DAOs
        event_dao = EventDAOSQLite(conn)
        merch_dao = MerchDAOSQLite(conn)
        ticket_dao = TicketPriceDAOSQLite(conn)
        
        print(f"🌱 Poblando base de datos...")

        # --- INSERTAR EVENTO ---
        event_1 = {
            'id': '1',
            'name': 'Subsonic Festival 2026',
            'date': '2026-07-15 12:00:00',
            'image': 'https://images.unsplash.com/photo-1624929303661-22c5bce0169b?w=1080&q=80',
            'description': 'La experiencia más electrizante del verano.',
            'services': ['Camping', 'Food & Drinks'],
            'gallery': [],
            'mapImage': 'https://images.unsplash.com/photo-1516037172336-512c4aa6b16a?w=1200'
        }
        event_dao.create(event_1)

        # --- INSERTAR MERCH ---
        merch_item = {
            'id': 'm1', 
            'name': 'Subsonic Festival T-Shirt', 
            'price': 35.0, 
            'image': 'https://images.unsplash.com/photo-1605329540493-6741250d2bee?w=400', 
            'category': 'clothing'
        }
        # Nota: Asegúrate de que tu merch_dao.create use los nombres de campos correctos
        merch_dao.create(merch_item)

        print("🚀 ¡Todo listo! Base de datos preparada.")

    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    seed_database()