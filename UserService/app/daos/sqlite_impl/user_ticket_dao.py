import sqlite3
from app.daos.interfaces import IUserTicketDAO
from typing import List, Optional

class UserTicketDAOSQLite(IUserTicketDAO):
    def __init__(self, connection):
        self.conn = connection
        self.conn.row_factory = sqlite3.Row

    def create(self, ticket_data: dict) -> str:
        cursor = self.conn.cursor()
        query = """
            INSERT INTO user_tickets (id, user_id, ticket_price_id, status) 
            VALUES (?, ?, ?, ?)
        """
        try:
            cursor.execute(query, (
                ticket_data['id'], 
                ticket_data['user_id'], 
                ticket_data['ticket_price_id'], 
                ticket_data.get('status', 'ACTIVE')
            ))
            self.conn.commit()
            return ticket_data['id']
        except sqlite3.Error as err:
            self.conn.rollback()
            raise err
        finally:
            cursor.close()

    def get_by_user_id(self, user_id: str) -> List[dict]:
        """Alimenta la Vista 5: Perfil (entradas compradas por el usuario)."""
        cursor = self.conn.cursor()
        query = """
            SELECT ut.id as ticket_instance_id, ut.purchase_date, ut.status,
                   tp.type, tp.price, e.name as event_name, e.date as event_date
            FROM user_tickets ut
            JOIN ticket_prices tp ON ut.ticket_price_id = tp.id
            JOIN events e ON tp.event_id = e.id
            WHERE ut.user_id = ?
        """
        cursor.execute(query, (user_id,))
        
        tickets = [dict(row) for row in cursor.fetchall()]
        cursor.close()
        return tickets

    def update_status(self, ticket_instance_id: str, new_status: str) -> bool:
        """Para validar la entrada en la puerta."""
        cursor = self.conn.cursor()
        query = "UPDATE user_tickets SET status = ? WHERE id = ?"
        try:
            cursor.execute(query, (new_status, ticket_instance_id))
            self.conn.commit()
            return cursor.rowcount > 0
        except sqlite3.Error as err:
            self.conn.rollback()
            raise err
        finally:
            cursor.close()

    def get_by_id(self, ticket_instance_id: str) -> Optional[dict]:
        cursor = self.conn.cursor()
        query = "SELECT * FROM user_tickets WHERE id = ?"
        cursor.execute(query, (ticket_instance_id,))
        row = cursor.fetchone()
        cursor.close()
        return dict(row) if row else None
    
    