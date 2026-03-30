import sqlite3
import json
from app.daos.interfaces import ITicketDAO
from typing import List, Optional

class TicketPriceDAOSQLite(ITicketDAO):
    def __init__(self, connection):
        self.conn = connection
        self.conn.row_factory = sqlite3.Row

    def _parse_json_features(self, row) -> dict:
        if not row: 
            return row
        
        row_dict = dict(row)
        
        if isinstance(row_dict.get('features'), str):
            row_dict['features'] = json.loads(row_dict['features'])
            
        return row_dict

    def create(self, ticket_data: dict) -> str:
        cursor = self.conn.cursor()
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
        cursor = self.conn.cursor()
        query = "SELECT * FROM ticket_prices WHERE event_id = ?"
        cursor.execute(query, (event_id,))
        tickets = cursor.fetchall()
        cursor.close()
        
        return [self._parse_json_features(ticket) for ticket in tickets]
        
    def get_by_id(self, ticket_price_id: str) -> Optional[dict]:
        cursor = self.conn.cursor()
        query = "SELECT * FROM ticket_prices WHERE id = ?"
        cursor.execute(query, (ticket_price_id,))
        row = cursor.fetchone()
        cursor.close()
        
        if row:
            item = dict(row)
            if isinstance(item.get('features'), str):
                import json
                try:
                    item['features'] = json.loads(item['features'])
                except:
                    pass
            return item
        return None