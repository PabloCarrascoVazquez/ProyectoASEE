import mysql.connector
from app.daos.interfaces import IArtistDAO
from typing import List, Optional

class ArtistDAOMySQL:
    def __init__(self, connection):
        self.conn = connection

    def create(self, artist_data: dict) -> str:
        cursor = self.conn.cursor()
        query = """
            INSERT INTO artists (id, name, genre, image, spotifyUrl) 
            VALUES (%s, %s, %s, %s, %s)
        """
        try:
            cursor.execute(query, (
                artist_data['id'], artist_data['name'], 
                artist_data['genre'], artist_data.get('image'), 
                artist_data.get('spotifyUrl')
            ))
            self.conn.commit()
            return artist_data['id']
        except mysql.connector.Error as err:
            self.conn.rollback()
            raise err
        finally:
            cursor.close()

    def get_all(self) -> List[dict]:
        """Alimenta la Vista 3: Música, mostrando todos los artistas del festival."""
        cursor = self.conn.cursor(dictionary=True)
        query = "SELECT * FROM artists ORDER BY name ASC"
        cursor.execute(query)
        artists = cursor.fetchall()
        cursor.close()
        return artists

    def get_by_event_id(self, event_id: str) -> List[dict]:
        """Trae el Line-Up de un evento específico (Resolución de relación N:M)."""
        cursor = self.conn.cursor(dictionary=True)
        query = """
            SELECT a.id, a.name, a.genre, a.image, a.spotifyUrl 
            FROM artists a
            JOIN event_artists ea ON a.id = ea.artist_id
            WHERE ea.event_id = %s
        """
        cursor.execute(query, (event_id,))
        artists = cursor.fetchall()
        cursor.close()
        return artists