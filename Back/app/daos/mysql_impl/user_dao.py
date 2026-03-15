import mysql.connector
from app.daos.interfaces import IUserDAO
from typing import Optional, List

class UserDAOMySQL(IUserDAO):
    def __init__(self, connection):
        self.conn = connection

    def create(self, user_data: dict) -> str:
        cursor = self.conn.cursor()
        query = """
            INSERT INTO users (id, name, email, password_hash, avatar) 
            VALUES (%s, %s, %s, %s, %s)
        """
        try:
            cursor.execute(query, (
                user_data['id'], 
                user_data['name'], 
                user_data['email'], 
                user_data['password_hash'], 
                user_data.get('avatar')
            ))
            self.conn.commit()
            return user_data['id']
        except mysql.connector.Error as err:
            self.conn.rollback()
            raise err
        finally:
            cursor.close()

    def get_by_email(self, email: str) -> Optional[dict]:
        """Crítico para el Login: Recupera el usuario por su email."""
        cursor = self.conn.cursor(dictionary=True) # Devuelve un diccionario en lugar de tupla
        query = "SELECT * FROM users WHERE email = %s"
        cursor.execute(query, (email,))
        user = cursor.fetchone()
        cursor.close()
        return user

    def get_user_tickets(self, user_id: str) -> List[dict]:
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