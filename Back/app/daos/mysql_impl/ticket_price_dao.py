import mysql.connector
import json
from app.daos.interfaces import ITicketDAO
from typing import List, Optional

class TicketPriceDAOMySQL:
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

    def get_by_id(self, ticket_price_id: str) -> Optional[dict]:
            cursor = self.conn.cursor(dictionary=True)

            query = "SELECT * FROM ticket_prices WHERE id = %s"
            
            try:
                cursor.execute(query, (ticket_price_id,))
                item = cursor.fetchone()
                
                if item:
                    if isinstance(item.get('features'), str):
                        import json
                        try:
                            item['features'] = json.loads(item['features'])
                        except (json.JSONDecodeError, TypeError):
                            item['features'] = []
                    return item
                    
                return None
                
            except mysql.connector.Error as err:
                print(f"Error en MySQL: {err}")
                return None
            finally:
                cursor.close()