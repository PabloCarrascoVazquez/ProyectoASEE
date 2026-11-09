import sqlite3
import json
from typing import Optional, List
from app.daos.interfaces import ICatalogDAO 

class CatalogDAOSQLite(ICatalogDAO):
    def __init__(self, connection: sqlite3.Connection):
        self.conn = connection
        self.conn.row_factory = sqlite3.Row

    # ==========================================
    # FESTIVALES
    # ==========================================
    def get_all_festivales(self) -> List[dict]:
        cursor = self.conn.cursor()
        query = """
            SELECT id_festival, nombre, fecha_inicio, fecha_fin, ubicacion, artistas_destacados 
            FROM festivales
        """
        try:
            cursor.execute(query)
            rows = cursor.fetchall()
            festivales = [dict(row) for row in rows]
            
            for fest in festivales:
                if isinstance(fest.get('artistas_destacados'), str):
                    try:
                        fest['artistas_destacados'] = json.loads(fest['artistas_destacados'])
                    except json.JSONDecodeError:
                        fest['artistas_destacados'] = []
            return festivales
        finally:
            cursor.close()

    def create_festival(self, festival_data: dict) -> str:
        cursor = self.conn.cursor()
        id_festival = festival_data.get('id_festival')
        if not id_festival:
            import uuid
            id_festival = f"fest_{uuid.uuid4().hex[:8]}"
            festival_data['id_festival'] = id_festival

        query = """
            INSERT INTO festivales (id_festival, nombre, fecha_inicio, fecha_fin, ubicacion, artistas_destacados)
            VALUES (?, ?, ?, ?, ?, ?)
        """
        try:
            artistas_json = json.dumps(festival_data.get('artistas_destacados', []))
            cursor.execute(query, (
                id_festival,
                festival_data.get('nombre'),
                festival_data.get('fecha_inicio'),
                festival_data.get('fecha_fin'),
                festival_data.get('ubicacion'),
                artistas_json
            ))
            self.conn.commit()
            return id_festival
        except Exception as err:
            self.conn.rollback()
            raise err
        finally:
            cursor.close()

    def update_festival(self, id_festival: str, festival_data: dict) -> bool:
        cursor = self.conn.cursor()
        query = "UPDATE festivales SET nombre=?, fecha_inicio=?, fecha_fin=?, ubicacion=? WHERE id_festival=?"
        try:
            cursor.execute(query, (
                festival_data.get('nombre'), festival_data.get('fecha_inicio'), 
                festival_data.get('fecha_fin'), festival_data.get('ubicacion'), id_festival
            ))
            self.conn.commit()
            return cursor.rowcount > 0
        except Exception as err:
            self.conn.rollback()
            raise err
        finally:
            cursor.close()

    def delete_festival(self, id_festival: str) -> bool:
        cursor = self.conn.cursor()
        try:
            cursor.execute("DELETE FROM festivales WHERE id_festival=?", (id_festival,))
            self.conn.commit()
            return cursor.rowcount > 0
        except Exception as err:
            self.conn.rollback()
            raise err
        finally:
            cursor.close()

    # ==========================================
    # ESPACIOS Y ALQUILERES
    # ==========================================
    def get_espacios_by_festival(self, id_festival: str) -> List[dict]:
        cursor = self.conn.cursor()
        query = """
            SELECT id_espacio, tipo, metros_cuadrados, precio_alquiler, estado 
            FROM espacios 
            WHERE id_festival = ?
        """
        try:
            cursor.execute(query, (id_festival,))
            rows = cursor.fetchall()
            return [dict(row) for row in rows]
        finally:
            cursor.close()

    def create_espacio(self, id_festival: str, espacio_data: dict) -> bool:
        cursor = self.conn.cursor()
        query = "INSERT INTO espacios (id_festival, tipo, metros_cuadrados, precio_alquiler, estado) VALUES (?, ?, ?, ?, 'disponible')"
        try:
            cursor.execute(query, (
                id_festival, espacio_data.get('tipo'), 
                espacio_data.get('metros_cuadrados', 0), espacio_data.get('precio_alquiler')
            ))
            self.conn.commit()
            return True
        except Exception as err:
            self.conn.rollback()
            raise err
        finally:
            cursor.close()

    def create_alquiler(self, alquiler_data: dict) -> bool:
        cursor = self.conn.cursor()
        query_alquiler = """
            INSERT INTO alquileres (id_contrato, id_espacio, nombre_negocio, tipo_negocio, necesita_conexion_electrica, estado, fecha_solicitud) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """
        query_update = "UPDATE espacios SET estado = 'alquilado' WHERE id_espacio = ?"
        
        try:
            cursor.execute(query_alquiler, (
                alquiler_data['id_contrato'],
                alquiler_data['id_espacio'],
                alquiler_data['nombre_negocio'],
                alquiler_data['tipo_negocio'],
                alquiler_data['necesita_conexion_electrica'],
                alquiler_data['estado'],
                alquiler_data['fecha_solicitud']
            ))
            cursor.execute(query_update, (alquiler_data['id_espacio'],))
            self.conn.commit()
            return True
        except Exception as err:
            self.conn.rollback()
            raise err
        finally:
            cursor.close()

    # ==========================================
    # ENTRADAS
    # ==========================================
    def get_entradas_by_festival(self, id_festival: str) -> List[dict]:
        cursor = self.conn.cursor()
        query = """
            SELECT tipo, precio, disponibles 
            FROM tipos_entrada 
            WHERE id_festival = ?
        """
        try:
            cursor.execute(query, (id_festival,))
            rows = cursor.fetchall()
            return [dict(row) for row in rows]
        finally:
            cursor.close()

    def create_entradas(self, id_festival: str, entradas_data: dict) -> bool:
        cursor = self.conn.cursor()
        query = "INSERT INTO tipos_entrada (id_festival, tipo, precio, disponibles) VALUES (?, ?, ?, ?)"
        try:
            cursor.execute(query, (
                id_festival, entradas_data.get('tipo'), 
                entradas_data.get('precio'), entradas_data.get('disponibles')
            ))
            self.conn.commit()
            return True
        except Exception as err:
            self.conn.rollback()
            raise err
        finally:
            cursor.close()

    def bloquear_cupo(self, id_festival: str, tipo_entrada: str, cantidad: int) -> bool:
        cursor = self.conn.cursor()
        query = """
            UPDATE tipos_entrada 
            SET disponibles = disponibles - ? 
            WHERE id_festival = ? AND tipo = ? AND disponibles >= ?
        """
        try:
            cursor.execute(query, (cantidad, id_festival, tipo_entrada, cantidad))
            self.conn.commit()
            return cursor.rowcount > 0
        except Exception as err:
            self.conn.rollback()
            raise err
        finally:
            cursor.close()

    def liberar_cupo(self, id_festival: str, tipo_entrada: str, cantidad: int) -> bool:
        cursor = self.conn.cursor()
        query = """
            UPDATE tipos_entrada 
            SET disponibles = disponibles + ? 
            WHERE id_festival = ? AND tipo = ?
        """
        try:
            cursor.execute(query, (cantidad, id_festival, tipo_entrada))
            self.conn.commit()
            return cursor.rowcount > 0
        except Exception as err:
            self.conn.rollback()
            raise err
        finally:
            cursor.close()

    # ==========================================
    # ARTISTAS FAVORITOS
    # ==========================================
    def add_artista_favorito(self, user_id: str, id_festival: str, nombre_artista: str) -> bool:
        cursor = self.conn.cursor()
        query = """
            INSERT INTO artistas_favoritos (user_id, id_festival, nombre_artista) 
            VALUES (?, ?, ?)
        """
        try:
            cursor.execute(query, (user_id, id_festival, nombre_artista))
            self.conn.commit()
            return True
        except Exception as err:
            self.conn.rollback()
            raise err
        finally:
            cursor.close()

    # ==========================================
    # ARTISTAS
    # ==========================================
    def create_artista(self, artista_data: dict) -> int:
        cursor = self.conn.cursor()
        query = """
            INSERT INTO artistas (nombre, genero, popularidad) 
            VALUES (?, ?, ?)
        """
        try:
            cursor.execute(query, (
                artista_data.get('nombre'),
                artista_data.get('genero'),
                artista_data.get('popularidad', 0)
            ))
            self.conn.commit()
            return cursor.lastrowid
        except Exception as err:
            self.conn.rollback()
            raise err
        finally:
            cursor.close()