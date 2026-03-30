import sqlite3
from app.daos.interfaces import IUserDAO
from typing import Optional, List

class UserDAOSQLite(IUserDAO):
    def __init__(self, connection):
        self.conn = connection
        self.conn.row_factory = sqlite3.Row

    def create(self, user_data: dict) -> str:
        cursor = self.conn.cursor()
        query = """
            INSERT INTO users (id, name, email, password_hash, avatar) 
            VALUES (?, ?, ?, ?, ?)
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
        except sqlite3.Error as err:
            self.conn.rollback()
            raise err
        finally:
            cursor.close()

    def get_by_email(self, email: str) -> Optional[dict]:
        """Crítico para el Login: Recupera el usuario por su email."""
        cursor = self.conn.cursor()
        query = "SELECT * FROM users WHERE email = ?"
        cursor.execute(query, (email,))
        user = cursor.fetchone()
        cursor.close()
        
        return dict(user) if user else None
    
    def get_by_id(self, user_id: str) -> Optional[dict]:
        cursor = self.conn.cursor()
        query = "SELECT * FROM users WHERE id = ?"
        cursor.execute(query, (user_id,))
        row = cursor.fetchone()
        return dict(row) if row else None