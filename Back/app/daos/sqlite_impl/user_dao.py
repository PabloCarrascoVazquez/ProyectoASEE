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
            INSERT INTO users (id, name, email, password_hash, role, avatar)
            VALUES (?, ?, ?, ?, ?, ?)
        """
        try:
            cursor.execute(query, (
                user_data['id'],
                user_data['name'],
                user_data['email'],
                user_data['password_hash'],
                user_data.get('role', 'user'),
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

    def update(self, user_id: str, fields: dict) -> bool:
        """Actualiza los campos pasados en el diccionario para un usuario."""
        if not fields:
            return False

        allowed = {'name', 'email', 'avatar', 'role', 'password_hash'}
        clean = {k: v for k, v in fields.items() if k in allowed}
        if not clean:
            return False

        set_clause = ", ".join(f"{k} = ?" for k in clean.keys())
        values = list(clean.values()) + [user_id]

        cursor = self.conn.cursor()
        try:
            cursor.execute(f"UPDATE users SET {set_clause} WHERE id = ?", values)
            self.conn.commit()
            return cursor.rowcount > 0
        except sqlite3.Error as err:
            self.conn.rollback()
            raise err
        finally:
            cursor.close()
