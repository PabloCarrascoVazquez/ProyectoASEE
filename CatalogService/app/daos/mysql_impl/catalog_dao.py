import mysql.connector
import json
from typing import Optional, List
# Suponiendo que crearás ICatalogDAO en interfaces.py al igual que IUserDAO
from app.daos.interfaces import ICatalogDAO 

class CatalogDAOMySQL(ICatalogDAO):
    def __init__(self, connection):
        self.conn = connection

    # ==========================================
    # FESTIVALES
    # ==========================================
    def get_all_festivales(self) -> List[dict]:
        """Recupera la lista de todos los festivales disponibles."""
        cursor = self.conn.cursor(dictionary=True)
        query = """
            SELECT id_festival, nombre, fecha_inicio, fecha_fin, ubicacion, artistas_destacados 
            FROM festivales
        """
        try:
            cursor.execute(query)
            festivales = cursor.fetchall()
            # Convertimos la cadena JSON de artistas a una lista de Python si es necesario
            for fest in festivales:
                if isinstance(fest.get('artistas_destacados'), str):
                    fest['artistas_destacados'] = json.loads(fest['artistas_destacados'])
            return festivales
        finally:
            cursor.close()

    def create_festival(self, festival_data: dict) -> str:
        """Inserta un nuevo festival en la base de datos MySQL."""
        cursor = self.conn.cursor()
        id_festival = festival_data.get('id_festival')
        if not id_festival:
            import uuid
            id_festival = f"fest_{uuid.uuid4().hex[:8]}"
            festival_data['id_festival'] = id_festival

        query = """
            INSERT INTO festivales (id_festival, nombre, fecha_inicio, fecha_fin, ubicacion, artistas_destacados)
            VALUES (%s, %s, %s, %s, %s, %s)
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
        except mysql.connector.Error as err:
            self.conn.rollback()
            raise err
        finally:
            cursor.close()

    def update_festival(self, id_festival: str, festival_data: dict) -> bool:
        cursor = self.conn.cursor()
        query = "UPDATE festivales SET nombre=%s, fecha_inicio=%s, fecha_fin=%s, ubicacion=%s WHERE id_festival=%s"
        try:
            cursor.execute(query, (
                festival_data.get('nombre'), festival_data.get('fecha_inicio'), 
                festival_data.get('fecha_fin'), festival_data.get('ubicacion'), id_festival
            ))
            self.conn.commit()
            return cursor.rowcount > 0
        except mysql.connector.Error as err:
            self.conn.rollback()
            raise err
        finally:
            cursor.close()

    def delete_festival(self, id_festival: str) -> bool:
        cursor = self.conn.cursor()
        try:
            cursor.execute("DELETE FROM festivales WHERE id_festival=%s", (id_festival,))
            self.conn.commit()
            return cursor.rowcount > 0
        except mysql.connector.Error as err:
            self.conn.rollback()
            raise err
        finally:
            cursor.close()

    # ==========================================
    # ESPACIOS Y ALQUILERES
    # ==========================================
    def get_espacios_by_festival(self, id_festival: str) -> List[dict]:
        """Recupera las parcelas de un festival concreto."""
        cursor = self.conn.cursor(dictionary=True)
        query = """
            SELECT id_espacio, tipo, metros_cuadrados, precio_alquiler, estado 
            FROM espacios 
            WHERE id_festival = %s
        """
        try:
            cursor.execute(query, (id_festival,))
            return cursor.fetchall()
        finally:
            cursor.close()

    def create_espacio(self, id_festival: str, espacio_data: dict) -> bool:
        cursor = self.conn.cursor()
        query = "INSERT INTO espacios (id_festival, tipo, metros_cuadrados, precio_alquiler, estado) VALUES (%s, %s, %s, %s, 'disponible')"
        try:
            cursor.execute(query, (
                id_festival, espacio_data.get('tipo'), 
                espacio_data.get('metros_cuadrados', 0), espacio_data.get('precio_alquiler')
            ))
            self.conn.commit()
            return True
        except mysql.connector.Error as err:
            self.conn.rollback()
            raise err
        finally:
            cursor.close()

    def create_alquiler(self, alquiler_data: dict) -> bool:
        """Registra un nuevo contrato de alquiler para un espacio."""
        cursor = self.conn.cursor()
        query = """
            INSERT INTO alquileres (id_contrato, id_espacio, nombre_negocio, tipo_negocio, necesita_conexion_electrica, estado, fecha_solicitud) 
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        try:
            cursor.execute(query, (
                alquiler_data['id_contrato'],
                alquiler_data['id_espacio'],
                alquiler_data['nombre_negocio'],
                alquiler_data['tipo_negocio'],
                alquiler_data['necesita_conexion_electrica'],
                alquiler_data['estado'],
                alquiler_data['fecha_solicitud']
            ))
            # Opcional: Actualizar el estado del espacio a 'reservado' o 'alquilado'
            update_espacio_query = "UPDATE espacios SET estado = 'alquilado' WHERE id_espacio = %s"
            cursor.execute(update_espacio_query, (alquiler_data['id_espacio'],))
            
            self.conn.commit()
            return True
        except mysql.connector.Error as err:
            self.conn.rollback()
            raise err
        finally:
            cursor.close()

    # ==========================================
    # ENTRADAS
    # ==========================================
    def get_entradas_by_festival(self, id_festival: str) -> List[dict]:
        """Recupera los tipos de entrada y stock disponible para un festival."""
        cursor = self.conn.cursor(dictionary=True)
        query = """
            SELECT tipo, precio, disponibles 
            FROM tipos_entrada 
            WHERE id_festival = %s
        """
        try:
            cursor.execute(query, (id_festival,))
            return cursor.fetchall()
        finally:
            cursor.close()

    def create_entradas(self, id_festival: str, entradas_data: dict) -> bool:
        cursor = self.conn.cursor()
        query = "INSERT INTO tipos_entrada (id_festival, tipo, precio, disponibles) VALUES (%s, %s, %s, %s)"
        try:
            cursor.execute(query, (
                id_festival, entradas_data.get('tipo'), 
                entradas_data.get('precio'), entradas_data.get('disponibles')
            ))
            self.conn.commit()
            return True
        except mysql.connector.Error as err:
            self.conn.rollback()
            raise err
        finally:
            cursor.close()

    def bloquear_cupo(self, id_festival: str, tipo_entrada: str, cantidad: int) -> bool:
        """Resta la cantidad del stock disponible (si hay suficiente)."""
        cursor = self.conn.cursor()
        # El AND disponibles >= %s asegura que no haya stock negativo (overbooking)
        query = """
            UPDATE tipos_entrada 
            SET disponibles = disponibles - %s 
            WHERE id_festival = %s AND tipo = %s AND disponibles >= %s
        """
        try:
            cursor.execute(query, (cantidad, id_festival, tipo_entrada, cantidad))
            self.conn.commit()
            # rowcount > 0 significa que se actualizó (había stock suficiente)
            return cursor.rowcount > 0
        except mysql.connector.Error as err:
            self.conn.rollback()
            raise err
        finally:
            cursor.close()

    def liberar_cupo(self, id_festival: str, tipo_entrada: str, cantidad: int) -> bool:
        """Suma la cantidad devuelta al stock disponible."""
        cursor = self.conn.cursor()
        query = """
            UPDATE tipos_entrada 
            SET disponibles = disponibles + %s 
            WHERE id_festival = %s AND tipo = %s
        """
        try:
            cursor.execute(query, (cantidad, id_festival, tipo_entrada))
            self.conn.commit()
            return cursor.rowcount > 0
        except mysql.connector.Error as err:
            self.conn.rollback()
            raise err
        finally:
            cursor.close()

    # ==========================================
    # ARTISTAS FAVORITOS
    # ==========================================
    def add_artista_favorito(self, user_id: str, id_festival: str, nombre_artista: str) -> bool:
        """Añade un artista a la lista de favoritos de un usuario."""
        cursor = self.conn.cursor()
        query = """
            INSERT INTO artistas_favoritos (user_id, id_festival, nombre_artista) 
            VALUES (%s, %s, %s)
        """
        try:
            cursor.execute(query, (user_id, id_festival, nombre_artista))
            self.conn.commit()
            return True
        except mysql.connector.Error as err:
            self.conn.rollback()
            raise err
        finally:
            cursor.close()

    # ==========================================
    # ARTISTAS
    # ==========================================
    def create_artista(self, artista_data: dict) -> int:
        """Registra un nuevo artista en el catálogo general MySQL."""
        cursor = self.conn.cursor()
        query = """
            INSERT INTO artistas (nombre, genero, popularidad) 
            VALUES (%s, %s, %s)
        """
        try:
            cursor.execute(query, (
                artista_data.get('nombre'),
                artista_data.get('genero'),
                artista_data.get('popularidad', 0)
            ))
            self.conn.commit()
            return cursor.lastrowid
        except mysql.connector.Error as err:
            self.conn.rollback()
            raise err
        finally:
            cursor.close()