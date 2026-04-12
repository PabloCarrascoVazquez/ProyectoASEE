import mysql.connector
from typing import List, Optional

class UserMerchDAOMySQL:
    def __init__(self, connection):
        self.conn = connection

    def create(self, purchase_data: dict) -> str:
        """Registra la compra de un artículo de merchandising."""
        cursor = self.conn.cursor()
        query = """
            INSERT INTO merch_purchases (id, user_id, merch_id, quantity, total_price, status) 
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        try:
            cursor.execute(query, (
                purchase_data['id'], 
                purchase_data['user_id'], 
                purchase_data['merch_id'], 
                purchase_data['quantity'],
                purchase_data['total_price'],
                purchase_data.get('status', 'PENDING') # PENDING, SHIPPED, DELIVERED
            ))
            self.conn.commit()
            return purchase_data['id']
        except mysql.connector.Error as err:
            self.conn.rollback()
            raise err
        finally:
            cursor.close()

    def get_by_user_id(self, user_id: str) -> List[dict]:
        """Obtiene el historial de compras de merch de un usuario para su Perfil."""
        cursor = self.conn.cursor(dictionary=True)
        query = """
            SELECT mp.id as purchase_id, mp.quantity, mp.total_price, mp.status, mp.purchase_date,
                   mi.name as product_name, mi.image as product_image, mi.category
            FROM merch_purchases mp
            JOIN merchandise_items mi ON mp.merch_id = mi.id
            WHERE mp.user_id = %s
            ORDER BY mp.purchase_date DESC
        """
        try:
            cursor.execute(query, (user_id,))
            purchases = cursor.fetchall()
            return purchases
        finally:
            cursor.close()

    def update_status(self, purchase_id: str, new_status: str) -> bool:
        """Actualiza el estado del pedido (ej. de PENDING a DELIVERED)."""
        cursor = self.conn.cursor()
        query = "UPDATE merch_purchases SET status = %s WHERE id = %s"
        try:
            cursor.execute(query, (new_status, purchase_id))
            self.conn.commit()
            return cursor.rowcount > 0
        except mysql.connector.Error as err:
            self.conn.rollback()
            raise err
        finally:
            cursor.close()