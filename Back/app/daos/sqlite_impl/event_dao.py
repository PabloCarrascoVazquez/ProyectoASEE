import sqlite3
import json
from app.daos.interfaces import IEventDAO
from typing import Optional, List

class EventDAOSQLite(IEventDAO):
    def __init__(self, connection):
        self.conn = connection
        self.conn.row_factory = sqlite3.Row # Para poder acceder por nombre de columna

    def _parse_json_fields(self, row) -> Optional[dict]:
        """Utilidad privada para convertir los JSON guardados como TEXT a Listas de Python."""
        if not row: 
            return None
        
        # 1. Convertimos sqlite3.Row a un diccionario mutable
        row_dict = dict(row)
        
        # 2. Parseamos los JSON de texto a listas
        if isinstance(row_dict.get('services'), str):
            row_dict['services'] = json.loads(row_dict['services'])
        if isinstance(row_dict.get('gallery'), str):
            row_dict['gallery'] = json.loads(row_dict['gallery'])
            
        return row_dict

    def create(self, event_data: dict) -> str:
        cursor = self.conn.cursor()
        # Cambiamos los %s por ?
        query = """
            INSERT INTO events (id, name, date, description, image, services, gallery, mapImage) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
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
        except sqlite3.Error as err:
            self.conn.rollback()
            raise err
        finally:
            cursor.close()

    def get_by_id(self, event_id: str) -> Optional[dict]:
        cursor = self.conn.cursor()
        query = "SELECT * FROM events WHERE id = ?"
        cursor.execute(query, (event_id,))
        event = cursor.fetchone()
        cursor.close()
        
        # Pasamos el resultado por nuestro parseador
        return self._parse_json_fields(event)

    def get_all(self) -> List[dict]:
        """Alimenta la Vista 1: Inicio (Tarjetas destacadas)."""
        cursor = self.conn.cursor()
        query = "SELECT id, name, date, image FROM events ORDER BY date ASC"
        cursor.execute(query)
        
        # Convertimos la lista de Row a lista de diccionarios
        events = [dict(row) for row in cursor.fetchall()]
        cursor.close()
        return events