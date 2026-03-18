import mysql.connector
from app.daos.interfaces import IUserTicketDAO
from typing import List, Optional

class UserTicketDAOMySQL(IUserTicketDAO):
    def __init__(self, connection):
        self.conn = connection

    def create(self, ticket_data: dict) -> str:
        cursor = self.conn.cursor()
        query = """
            INSERT INTO user_tickets (id, user_id, ticket_price_id, status) 
            VALUES (%s, %s, %s, %s)
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
        except mysql.connector.Error as err:
            self.conn.rollback()
            raise err
        finally:
            cursor.close()

    def get_by_user_id(self, user_id: str) -> List[dict]:
        """Alimenta la Vista 5: Perfil (entradas compradas por el usuario)."""
        cursor = self.conn.cursor(dictionary=True)
        query = """
            SELECT ut.id as ticket_instance_id, ut.purchase_date, ut.status,
                   tp.type, tp.price, e.name as event_name, e.date as event_date
            FROM user_tickets ut
            JOIN ticket_prices tp ON ut.ticket_price_id = tp.id
            JOIN events e ON tp.event_id = e.id
            WHERE ut.user_id = %s
        """
        cursor.execute(query, (user_id,))
        tickets = cursor.fetchall()
        cursor.close()
        return tickets

    def update_status(self, ticket_instance_id: str, new_status: str) -> bool:
        """Para validar la entrada en la puerta."""
        cursor = self.conn.cursor()
        query = "UPDATE user_tickets SET status = %s WHERE id = %s"
        try:
            cursor.execute(query, (new_status, ticket_instance_id))
            self.conn.commit()
            return cursor.rowcount > 0
        except mysql.connector.Error as err:
            self.conn.rollback()
            raise err
        finally:
            cursor.close()