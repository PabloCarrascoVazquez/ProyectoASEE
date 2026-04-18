import sqlite3
import json
from app.daos.interfaces import IVendorDAO
from typing import List

class VendorSpaceDAOSQLite(IVendorDAO):
    def __init__(self, connection):
        self.conn = connection
        self.conn.row_factory = sqlite3.Row

    def get_by_event_id(self, event_id: str) -> List[dict]:
        cursor = self.conn.cursor()
        query = "SELECT * FROM vendor_spaces WHERE event_id = ? AND available = TRUE"
        cursor.execute(query, (event_id,))
        vendors_rows = cursor.fetchall()
        cursor.close()
        
        vendors = []
        for row in vendors_rows:
            vendor = dict(row)
            if isinstance(vendor.get('services'), str):
                vendor['services'] = json.loads(vendor['services'])
            vendors.append(vendor)
            
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

    def get_all(self) -> List[dict]:
        cursor = self.conn.cursor()
        cursor.execute("SELECT * FROM vendor_spaces")
        rows = cursor.fetchall()
        cursor.close()

        result = []
        for row in rows:
            v = dict(row)
            if isinstance(v.get('services'), str):
                try:
                    v['services'] = json.loads(v['services'])
                except Exception:
                    v['services'] = []
            result.append(v)
        return result

    def get_by_id(self, space_id: str):
        cursor = self.conn.cursor()
        cursor.execute("SELECT * FROM vendor_spaces WHERE id = ?", (space_id,))
        row = cursor.fetchone()
        cursor.close()
        if not row:
            return None
        v = dict(row)
        if isinstance(v.get('services'), str):
            try:
                v['services'] = json.loads(v['services'])
            except Exception:
                v['services'] = []
        return v

    def update_availability(self, space_id: str, is_available: bool) -> bool:
        cursor = self.conn.cursor()
        try:
            cursor.execute(
                "UPDATE vendor_spaces SET available = ? WHERE id = ?",
                (1 if is_available else 0, space_id)
            )
            self.conn.commit()
            return cursor.rowcount > 0
        finally:
            cursor.close()

    def delete(self, space_id: str) -> bool:
        cursor = self.conn.cursor()
        try:
            cursor.execute("DELETE FROM vendor_spaces WHERE id = ?", (space_id,))
            self.conn.commit()
            return cursor.rowcount > 0
        except sqlite3.Error as err:
            self.conn.rollback()
            raise err
        finally:
            cursor.close()