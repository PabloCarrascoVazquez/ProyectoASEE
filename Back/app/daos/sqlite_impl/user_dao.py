import sqlite3
from app.daos.interfaces import IUserDAO
from typing import Optional, List

class UserDAOSQLite(IUserDAO):
    def __init__(self, connection):
        self.conn = connection
        self.conn.row_factory = sqlite3.Row # Magia para columnas por nombre

    def create(self, user_data: dict) -> str:
        cursor = self.conn.cursor()
        # Cambiamos los %s por ?
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
        cursor = self.conn.cursor() # Sin dictionary=True
        # Cambiamos el %s por ?
        query = "SELECT * FROM users WHERE email = ?"
        cursor.execute(query, (email,))
        user = cursor.fetchone()
        cursor.close()
        
        # Si encuentra al usuario, lo convierte a dict. Si no, devuelve None
        return dict(user) if user else None