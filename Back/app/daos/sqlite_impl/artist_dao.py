import sqlite3 # 1. Usamos la librería nativa de Python
from app.daos.interfaces import IArtistDAO
from app.daos.factories import DAOFactory, DatabaseConnectionFactory
from typing import List, Optional
import uuid

# ¡Añadimos (IArtistDAO) para obligar a que cumpla el contrato!
class ArtistDAOSQLite(IArtistDAO):
    def __init__(self, connection):
        self.conn = connection
        # 2. SQLite necesita esto para devolver los datos como Diccionarios y no como Tuplas
        self.conn.row_factory = sqlite3.Row 

    def create(self, artist_data: dict) -> str:
        cursor = self.conn.cursor()
        # 3. En SQLite, los comodines de seguridad son '?' en lugar de '%s'
        query = """
            INSERT INTO artists (id, name, genre, image, spotifyUrl) 
            VALUES (?, ?, ?, ?, ?)
        """
        try:
            cursor.execute(query, (
                artist_data['id'], artist_data['name'], 
                artist_data['genre'], artist_data.get('image'), 
                artist_data.get('spotifyUrl')
            ))
            self.conn.commit()
            return artist_data['id']
        except sqlite3.Error as err:
            self.conn.rollback()
            raise err
        finally:
            cursor.close()

    def get_all(self) -> List[dict]:
        """Alimenta la Vista 3: Música, mostrando todos los artistas del festival."""
        cursor = self.conn.cursor() # Ya no pasamos dictionary=True aquí
        query = "SELECT * FROM artists ORDER BY name ASC"
        cursor.execute(query)
        # Convertimos los resultados (sqlite3.Row) a diccionarios estándar de Python
        artists = [dict(row) for row in cursor.fetchall()]
        cursor.close()
        return artists

    def get_by_event_id(self, event_id: str) -> List[dict]:
        """Trae el Line-Up de un evento específico (Resolución de relación N:M)."""
        cursor = self.conn.cursor()
        # Cambiamos el %s por un ?
        query = """
            SELECT a.id, a.name, a.genre, a.image, a.spotifyUrl 
            FROM artists a
            JOIN event_artists ea ON a.id = ea.artist_id
            WHERE ea.event_id = ?
        """
        cursor.execute(query, (event_id,))
        artists = [dict(row) for row in cursor.fetchall()]
        cursor.close()
        return artists