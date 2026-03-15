import mysql.connector
import json
from app.daos.interfaces import ITicketDAO
from typing import List

class TicketPriceDAOMySQL(ITicketDAO):
    def __init__(self, connection):
        self.conn = connection

    def _parse_json_features(self, row: dict) -> dict:
        if row and isinstance(row.get('features'), str):
            row['features'] = json.loads(row['features'])
        return row

    def create(self, ticket_data: dict) -> str:
        cursor = self.conn.cursor()
        query = """
            INSERT INTO ticket_prices (id, event_id, type, price, description, features) 
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        try:
            cursor.execute(query, (
                ticket_data['id'], ticket_data['event_id'], ticket_data['type'], 
                ticket_data['price'], ticket_data.get('description'), 
                json.dumps(ticket_data.get('features', []))
            ))
            self.conn.commit()
            return ticket_data['id']
        except mysql.connector.Error as err:
            self.conn.rollback()
            raise err
        finally:
            cursor.close()

    def get_by_event_id(self, event_id: str) -> List[dict]:
        """Obtiene todos los precios y tipos de entrada para un evento concreto."""
        cursor = self.conn.cursor(dictionary=True)
        query = "SELECT * FROM ticket_prices WHERE event_id = %s"
        cursor.execute(query, (event_id,))
        tickets = cursor.fetchall()
        cursor.close()
        
        # Convertimos el string JSON 'features' de MySQL a list[] de Python para cada ticket
        return [self._parse_json_features(ticket) for ticket in tickets]