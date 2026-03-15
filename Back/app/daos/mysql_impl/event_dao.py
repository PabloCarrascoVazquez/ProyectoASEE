import mysql.connector
import json
from app.daos.interfaces import IEventDAO
from typing import Optional, List

class EventDAOMySQL(IEventDAO):
    def __init__(self, connection):
        self.conn = connection

    def _parse_json_fields(self, row: dict) -> dict:
        """Utilidad privada para convertir los JSON de MySQL a Listas de Python."""
        if not row: return row
        # MySQL devuelve los campos JSON como strings o bytearrays dependiendo del driver
        if isinstance(row.get('services'), str):
            row['services'] = json.loads(row['services'])
        if isinstance(row.get('gallery'), str):
            row['gallery'] = json.loads(row['gallery'])
        return row

    def create(self, event_data: dict) -> str:
        cursor = self.conn.cursor()
        query = """
            INSERT INTO events (id, name, date, description, image, services, gallery, mapImage) 
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        try:
            cursor.execute(query, (
                event_data['id'], event_data['name'], event_data['date'], 
                event_data['description'], event_data.get('image'),
                json.dumps(event_data.get('services', [])),
                json.dumps(event_data.get('gallery', [])),
                event_data.get('mapImage')
            ))
            self.conn.commit()
            return event_data['id']
        except mysql.connector.Error as err:
            self.conn.rollback()
            raise err
        finally:
            cursor.close()

    def get_by_id(self, event_id: str) -> Optional[dict]:
        cursor = self.conn.cursor(dictionary=True)
        query = "SELECT * FROM events WHERE id = %s"
        cursor.execute(query, (event_id,))
        event = cursor.fetchone()
        cursor.close()
        return self._parse_json_fields(event)

    def get_all(self) -> List[dict]:
        """Alimenta la Vista 1: Inicio (Tarjetas destacadas)."""
        cursor = self.conn.cursor(dictionary=True)
        query = "SELECT id, name, date, image FROM events ORDER BY date ASC"
        cursor.execute(query)
        events = cursor.fetchall()
        cursor.close()
        return events