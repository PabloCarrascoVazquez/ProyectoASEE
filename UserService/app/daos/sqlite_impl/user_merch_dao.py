import sqlite3
from typing import List, Optional

class UserMerchDAOSQLite:
    def __init__(self, connection):
        self.conn = connection

    def create(self, purchase_data: dict) -> str:
        cursor = self.conn.cursor()
        # Eliminamos 'merch_id' y usamos los campos descriptivos
        query = """
            INSERT INTO merch_purchases (
                id, user_id, product_name, price_at_purchase, 
                quantity, total_price, image, category, status, purchase_date
            ) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """
        try:
            cursor.execute(query, (
                purchase_data['id'], 
                purchase_data['user_id'], 
                purchase_data['product_name'], 
                purchase_data['price_at_purchase'],
                purchase_data['quantity'],
                purchase_data['total_price'],
                purchase_data.get('image'),
                purchase_data.get('category'),
                purchase_data.get('status', 'PENDING'),
                purchase_data.get('purchase_date')
            ))
            self.conn.commit()
            return purchase_data['id']
        except sqlite3.Error as e:
            self.conn.rollback()
            raise e

    def get_by_user_id(self, user_id: str) -> List[dict]:
        """Obtiene el historial de merch directamente de la tabla merch_purchases."""
        # Aseguramos que los resultados se puedan leer como diccionarios
        self.conn.row_factory = sqlite3.Row
        cursor = self.conn.cursor()
        
        # IMPORTANTE: Eliminamos el JOIN y la columna mp.merch_id que causa el error
        query = """
            SELECT 
                id as purchase_id, 
                product_name, 
                price_at_purchase, 
                quantity, 
                total_price, 
                image, 
                category, 
                status, 
                purchase_date
            FROM merch_purchases 
            WHERE user_id = ?
            ORDER BY purchase_date DESC
        """
        
        try:
            cursor.execute(query, (user_id,))
            # Convertimos cada fila en un diccionario para el Frontend
            return [dict(row) for row in cursor.fetchall()]
        except sqlite3.Error as e:
            print(f"Error en la consulta SQL: {e}")
            return []

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