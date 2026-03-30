import mysql.connector
import json
from app.daos.interfaces import IVendorDAO
from typing import List

class VendorSpaceDAOMySQL:
    def __init__(self, connection):
        self.conn = connection

    def get_by_event_id(self, event_id: str) -> List[dict]:
        cursor = self.conn.cursor(dictionary=True)
        query = "SELECT * FROM vendor_spaces WHERE event_id = %s AND available = TRUE"
        cursor.execute(query, (event_id,))
        vendors = cursor.fetchall()
        cursor.close()
        
        for vendor in vendors:
            if isinstance(vendor.get('services'), str):
                vendor['services'] = json.loads(vendor['services'])
        return vendors
    
    def create(self, space_data: dict):
        cursor = self.conn.cursor()
        query = """
            INSERT INTO vendor_spaces (id, event_id, name, available, services)
            VALUES (?, ?, ?, ?, ?)
        """
        
        services_json = json.dumps(space_data.get('services', []))
        
        try:
            cursor.execute(query, (
                space_data['id'],
                space_data['event_id'],
                space_data['name'],
                1 if space_data.get('available', True) else 0,
                services_json
            ))
            self.conn.commit()
        finally:
            cursor.close()


    def create(self, space_data: dict):
        cursor = self.conn.cursor()
        query = """
            INSERT INTO vendor_spaces (id, event_id, name, available, services)
            VALUES (?, ?, ?, ?, ?)
        """
        import json
        services_json = json.dumps(space_data.get('services', []))
        
        try:
            cursor.execute(query, (
                space_data['id'],
                space_data['event_id'],
                space_data['name'],
                1 if space_data.get('available', True) else 0,
                services_json
            ))
            self.conn.commit()
        except Exception as e:
            self.conn.rollback()
            raise e
        finally:
            cursor.close()