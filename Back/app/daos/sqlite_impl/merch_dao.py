import sqlite3
from app.daos.interfaces import IMerchandiseDAO
from typing import List

class MerchDAOSQLite(IMerchandiseDAO):
    def __init__(self, connection):
        self.conn = connection
        self.conn.row_factory = sqlite3.Row 

    def create(self, merch_data: dict) -> str:
        cursor = self.conn.cursor()
        query = """
            INSERT INTO merchandise_items (id, name, price, image, category) 
            VALUES (?, ?, ?, ?, ?)
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
        except sqlite3.Error as err:
            self.conn.rollback()
            raise err
        finally:
            cursor.close()

    def get_all(self) -> List[dict]:
        """Devuelve todo el catálogo de merchandising."""
        cursor = self.conn.cursor()
        query = "SELECT * FROM merchandise_items ORDER BY name ASC"
        cursor.execute(query)
        
        items = [dict(row) for row in cursor.fetchall()]
        cursor.close()
        return items

    def get_by_category(self, category: str) -> List[dict]:
        """Devuelve productos filtrados por categoría (ej. 'Ropa', 'Accesorios')."""
        cursor = self.conn.cursor()
        query = "SELECT * FROM merchandise_items WHERE category = ? ORDER BY name ASC"
        cursor.execute(query, (category,))
        
        items = [dict(row) for row in cursor.fetchall()]
        cursor.close()
        return items