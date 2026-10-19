import mysql.connector
from typing import Optional, List
from app.dao.interfaces import IUserDAO


class UserDAOMySQL(IUserDAO):
    def __init__(self, connection):
        self.conn = connection

    def create(self, user_data: dict) -> str:
        cursor = self.conn.cursor()
        query = """
            INSERT INTO users (id, name, email, password_hash, avatar, rol) 
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        try:
            cursor.execute(query, (
                user_data['id'],
                user_data['name'],
                user_data['email'],
                user_data['password_hash'],
                user_data.get('avatar'),
                user_data.get('rol', 'cliente')
            ))
            self.conn.commit()
            return user_data['id']
        except mysql.connector.Error as err:
            self.conn.rollback()
            raise err
        finally:
            cursor.close()

    def get_by_email(self, email: str) -> Optional[dict]:
        """Crítico para el Login: Recupera el usuario con su password_hash y rol."""
        cursor = self.conn.cursor(dictionary=True)
        query = """
            SELECT id, name, email, password_hash, avatar, rol 
            FROM users 
            WHERE email = %s
        """
        try:
            cursor.execute(query, (email,))
            return cursor.fetchone()
        finally:
            cursor.close()

    def get_by_id(self, user_id: str) -> Optional[dict]:
        """Recupera el usuario por su ID (usando %s y diccionario)."""
        cursor = self.conn.cursor(dictionary=True)
        query = """
            SELECT id, name, email, password_hash, avatar, rol 
            FROM users 
            WHERE id = %s
        """
        try:
            cursor.execute(query, (user_id,))
            return cursor.fetchone()
        finally:
            cursor.close()

    def update_profile(self, user_id: str, name: str, avatar: Optional[str]) -> bool:
        """Actualiza la información editable del perfil."""
        cursor = self.conn.cursor()
        query = """
            UPDATE users 
            SET name = %s, avatar = %s 
            WHERE id = %s
        """
        try:
            cursor.execute(query, (name, avatar, user_id))
            self.conn.commit()
            return cursor.rowcount > 0
        except mysql.connector.Error as err:
            self.conn.rollback()
            raise err
        finally:
            cursor.close()

    def update_role(self, user_id: str, rol: str) -> bool:
        """Permite a un admin cambiar el rol (admin, cliente, proveedor)."""
        cursor = self.conn.cursor()
        query = "UPDATE users SET rol = %s WHERE id = %s"
        try:
            cursor.execute(query, (rol, user_id))
            self.conn.commit()
            return cursor.rowcount > 0
        except mysql.connector.Error as err:
            self.conn.rollback()
            raise err
        finally:
            cursor.close()

    def delete(self, user_id: str) -> bool:
        """Eliminación de cuenta."""
        cursor = self.conn.cursor()
        query = "DELETE FROM users WHERE id = %s"
        try:
            cursor.execute(query, (user_id,))
            self.conn.commit()
            return cursor.rowcount > 0
        except mysql.connector.Error as err:
            self.conn.rollback()
            raise err
        finally:
            cursor.close()