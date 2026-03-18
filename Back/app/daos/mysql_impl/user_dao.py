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
        cursor = self.conn.cursor(dictionary=True)
        query = "SELECT * FROM users WHERE email = %s"
        cursor.execute(query, (email,))
        user = cursor.fetchone()
        cursor.close()
        return user