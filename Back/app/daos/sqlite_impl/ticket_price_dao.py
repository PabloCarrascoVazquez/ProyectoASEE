import sqlite3
import json
from app.daos.interfaces import ITicketDAO
from typing import List

class TicketPriceDAOSQLite(ITicketDAO): # <--- Añadida la herencia de la interfaz
    def __init__(self, connection):
        self.conn = connection
        self.conn.row_factory = sqlite3.Row # Magia para columnas por nombre

    def _parse_json_features(self, row) -> dict:
        if not row: 
            return row
        
        # 1. Convertimos la fila inmutable a un diccionario mutable de Python
        row_dict = dict(row)
        
        # 2. Convertimos el string JSON de SQLite a list[]
        if isinstance(row_dict.get('features'), str):
            row_dict['features'] = json.loads(row_dict['features'])
            
        return row_dict

    def create(self, ticket_data: dict) -> str:
        cursor = self.conn.cursor()
        # Cambiamos %s por ?
        query = """
            INSERT INTO ticket_prices (id, event_id, type, price, description, features) 
            VALUES (?, ?, ?, ?, ?, ?)
        """
        try:
            cursor.execute(query, (
                ticket_data['id'], ticket_data['event_id'], ticket_data['type'], 
                ticket_data['price'], ticket_data.get('description'), 
                json.dumps(ticket_data.get('features', []))
            ))
            self.conn.commit()
            return ticket_data['id']
        except sqlite3.Error as err:
            self.conn.rollback()
            raise err
        finally:
            cursor.close()

    def get_by_event_id(self, event_id: str) -> List[dict]:
        """Obtiene todos los precios y tipos de entrada para un evento concreto."""
        cursor = self.conn.cursor() # Sin dictionary=True
        # Cambiamos %s por ?
        query = "SELECT * FROM ticket_prices WHERE event_id = ?"
        cursor.execute(query, (event_id,))
        tickets = cursor.fetchall()
        cursor.close()
        
        # Pasamos cada fila de SQLite por nuestra función que parsea y convierte a dict
        return [self._parse_json_features(ticket) for ticket in tickets]