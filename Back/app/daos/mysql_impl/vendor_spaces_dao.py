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