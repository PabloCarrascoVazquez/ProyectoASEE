import mysql.connector
from typing import Optional, List
from app.daos.interfaces import IUserDAO


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

    def update(self, user_id: str, fields: dict) -> bool:
        """Actualiza los campos pasados en el diccionario para un usuario."""
        if not fields:
            return False

        allowed = {'name', 'email', 'avatar', 'rol', 'role', 'password_hash'}
        clean = {k: v for k, v in fields.items() if k in allowed}
        if not clean:
            return False

        if 'role' in clean and 'rol' not in clean:
            clean['rol'] = clean.pop('role')

        set_clause = ", ".join(f"{k} = %s" for k in clean.keys())
        values = list(clean.values()) + [user_id]

        cursor = self.conn.cursor()
        try:
            cursor.execute(f"UPDATE users SET {set_clause} WHERE id = %s", values)
            self.conn.commit()
            return cursor.rowcount > 0
        except mysql.connector.Error as err:
            self.conn.rollback()
            raise err
        finally:
            cursor.close()

    def update_profile(self, user_id: str, name: str, avatar: Optional[str]) -> bool:
        """Actualiza la información editable del perfil."""
        return self.update(user_id, {"name": name, "avatar": avatar})

    def update_role(self, user_id: str, rol: str) -> bool:
        """Permite a un admin cambiar el rol (admin, cliente, proveedor)."""
        return self.update(user_id, {"rol": rol})

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
