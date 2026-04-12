import sqlite3
from typing import List, Optional

class UserMerchDAOSQLite:
    def __init__(self, connection):
        self.conn = connection

    def create(self, purchase_data: dict) -> str:
        """Registra la compra de un artículo de merchandising en SQLite."""
        cursor = self.conn.cursor()
        query = """
            INSERT INTO merch_purchases (id, user_id, merch_id, quantity, total_price, status) 
            VALUES (?, ?, ?, ?, ?, ?)
        """
        try:
            cursor.execute(query, (
                purchase_data['id'], 
                purchase_data['user_id'], 
                purchase_data['merch_id'], 
                purchase_data['quantity'],
                purchase_data['total_price'],
                purchase_data.get('status', 'PENDING')
            ))
            self.conn.commit()
            return purchase_data['id']
        except sqlite3.Error as e:
            self.conn.rollback()
            raise e

    def get_by_user_id(self, user_id: str) -> List[dict]:
        """Obtiene el historial de merch para SQLite. 
        Asume que la conexión tiene row_factory = sqlite3.Row"""
        cursor = self.conn.cursor()
        query = """
            SELECT mp.id as purchase_id, mp.quantity, mp.total_price, mp.status, mp.purchase_date,
                   mi.name as product_name, mi.image as product_image, mi.category
            FROM merch_purchases mp
            JOIN merchandise_items mi ON mp.merch_id = mi.id
            WHERE mp.user_id = ?
            ORDER BY mp.purchase_date DESC
        """
        cursor.execute(query, (user_id,))
        # Convertimos las filas (sqlite3.Row) a diccionarios puros
        return [dict(row) for row in cursor.fetchall()]

    def update_status(self, purchase_id: str, new_status: str) -> bool:
        """Actualiza el estado del pedido."""
        cursor = self.conn.cursor()
        query = "UPDATE merch_purchases SET status = ? WHERE id = ?"
        try:
            cursor.execute(query, (new_status, purchase_id))
            self.conn.commit()
            return cursor.rowcount > 0
        except sqlite3.Error as e:
            self.conn.rollback()
            raise e