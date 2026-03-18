import sqlite3
import json
from app.daos.interfaces import IVendorDAO
from typing import List

class VendorSpaceDAOSQLite(IVendorDAO): # <--- Añadida la herencia
    def __init__(self, connection):
        self.conn = connection
        self.conn.row_factory = sqlite3.Row # Magia para columnas por nombre

    def get_by_event_id(self, event_id: str) -> List[dict]:
        cursor = self.conn.cursor() # Sin dictionary=True
        # Cambiamos %s por ?
        query = "SELECT * FROM vendor_spaces WHERE event_id = ? AND available = TRUE"
        cursor.execute(query, (event_id,))
        vendors_rows = cursor.fetchall()
        cursor.close()
        
        vendors = []
        for row in vendors_rows:
            vendor = dict(row) # 1. Convertimos la fila inmutable a diccionario
            # 2. Parseamos el JSON si existe
            if isinstance(vendor.get('services'), str):
                vendor['services'] = json.loads(vendor['services'])
            vendors.append(vendor)
            
        return vendors