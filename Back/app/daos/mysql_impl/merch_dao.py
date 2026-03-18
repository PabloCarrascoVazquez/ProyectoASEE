# Crear app/daos/mysql_impl/merch_dao.py

import mysql.connector
from app.daos.interfaces import IMerchandiseDAO
from typing import List

class MerchDAOMySQL(IMerchandiseDAO):
    def __init__(self, connection):
        self.conn = connection

    def create(self, merch_data: dict) -> str:
        cursor = self.conn.cursor()
        query = """
            INSERT INTO merchandise_items (id, name, price, image, category) 
            VALUES (%s, %s, %s, %s, %s)
        """
        try:
            cursor.execute(query, (
                merch_data['id'], 
                merch_data['name'], 
                merch_data['price'], 
                merch_data.get('image'), 
                merch_data['category']
            ))
            self.conn.commit()
            return merch_data['id']
        except mysql.connector.Error as err:
            self.conn.rollback()
            raise err
        finally:
            cursor.close()

    def get_all(self) -> List[dict]:
        """Devuelve todo el catálogo de merchandising."""
        cursor = self.conn.cursor(dictionary=True)
        query = "SELECT * FROM merchandise_items ORDER BY name ASC"
        cursor.execute(query)
        items = cursor.fetchall()
        cursor.close()
        return items

    def get_by_category(self, category: str) -> List[dict]:
        """Devuelve productos filtrados por categoría (ej. 'Ropa', 'Accesorios')."""
        cursor = self.conn.cursor(dictionary=True)
        query = "SELECT * FROM merchandise_items WHERE category = %s ORDER BY name ASC"
        cursor.execute(query, (category,))
        items = cursor.fetchall()
        cursor.close()
        return items