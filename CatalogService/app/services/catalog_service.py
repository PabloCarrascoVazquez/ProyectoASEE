from typing import List
from app.models.catalog import Festival, Espacio, TipoEntrada, Alquiler, ArtistaFavorito
from app.dtos.requests import BloqueoCupoRequest, AlquilerRequest, ArtistaFavoritoRequest
from app.dtos.responses import (
    FestivalResponse,
    EspacioResponse,
    TipoEntradaResponse,
    BloqueoCupoResponse,
    AlquilerResponse,
    ArtistaFavoritoResponse
)

class CatalogService:
    def __init__(self, catalog_dao):
        # Inyectamos el DAO (MySQL o SQLite) que nos pase la factoría
        self.catalog_dao = catalog_dao

    # ==========================================
    # FESTIVALES
    # ==========================================
    def get_all_festivales(self) -> List[FestivalResponse]:
        """Recupera todos los festivales de la BD y los convierte a DTOs."""
        rows = self.catalog_dao.get_all_festivales()
        return [Festival.from_db_row(row).to_response_dto() for row in rows]

    def crear_festival(self, data: dict) -> dict:
        """Crea un nuevo festival (delegando al DAO)."""
        # Validaciones de negocio básicas
        if "nombre" not in data or not data["nombre"].strip():
            raise ValueError("El nombre del festival es obligatorio.")
        
        # Inserción a través del DAO
        nuevo_id = self.catalog_dao.create_festival(data)
        
        # Devolvemos un diccionario que luego Flask convierte a JSON
        data["id"] = str(nuevo_id)
        return data

    def crear_artista(self, data: dict) -> dict:
        """Crea un nuevo artista en el catálogo general."""
        if "nombre" not in data or not data["nombre"].strip():
            raise ValueError("El nombre del artista es obligatorio.")
        
        nuevo_id = self.catalog_dao.create_artista(data)
        data["id"] = str(nuevo_id)
        return data

    def crear_entradas(self, id_festival: str, data: dict) -> None:
        if not data.get("tipo") or not data.get("precio") or not data.get("disponibles"):
            raise ValueError("Faltan datos obligatorios para crear la entrada.")
        self.catalog_dao.create_entradas(id_festival, data)

    def crear_espacio(self, id_festival: str, data: dict) -> None:
        if not data.get("tipo") or not data.get("precio_alquiler"):
            raise ValueError("Faltan datos obligatorios para el espacio.")
        self.catalog_dao.create_espacio(id_festival, data)

    def actualizar_festival(self, id_festival: str, data: dict) -> None:
        if "nombre" not in data or not data["nombre"].strip():
            raise ValueError("El nombre del festival no puede estar vacío.")
        self.catalog_dao.update_festival(id_festival, data)

    def borrar_festival(self, id_festival: str) -> None:
        self.catalog_dao.delete_festival(id_festival)

    # ==========================================
    # ESPACIOS Y ALQUILERES
    # ==========================================
    def get_espacios(self, id_festival: str) -> List[EspacioResponse]:
        """Recupera los espacios de un festival."""
        rows = self.catalog_dao.get_espacios_by_festival(id_festival)
        return [Espacio.from_db_row(row).to_response_dto() for row in rows]

    def crear_alquiler(self, id_espacio: str, request: AlquilerRequest) -> AlquilerResponse:
        """Procesa la solicitud de alquiler de un espacio."""
        # Instanciamos el modelo de dominio con los datos y autogeneramos el UUID y fecha
        nuevo_alquiler = Alquiler.from_alquiler_request(request, id_espacio)
        
        try:
            self.catalog_dao.create_alquiler(nuevo_alquiler.to_db_dict())
        except Exception:
            # Si salta un error (por ejemplo, violación de foreign key porque el espacio no existe)
            raise ValueError("ESPACIO_NO_ENCONTRADO")
            
        return nuevo_alquiler.to_response_dto()

    # ==========================================
    # ENTRADAS
    # ==========================================
    def get_entradas(self, id_festival: str) -> List[TipoEntradaResponse]:
        """Recupera los tipos de entradas disponibles."""
        rows = self.catalog_dao.get_entradas_by_festival(id_festival)
        return [TipoEntrada.from_db_row(row).to_response_dto() for row in rows]

    def bloquear_cupo(self, id_festival: str, request: BloqueoCupoRequest) -> BloqueoCupoResponse:
        """Intenta bloquear cupo. Si no hay stock, lanza error 409."""
        # 1. Buscamos primero el precio unitario consultando las entradas
        entradas_rows = self.catalog_dao.get_entradas_by_festival(id_festival)
        precio_unitario = 0.0
        tipo_valido = False
        
        for row in entradas_rows:
            if row["tipo"] == request.tipo_entrada:
                precio_unitario = float(row["precio"])
                tipo_valido = True
                break
                
        if not tipo_valido:
            raise ValueError("Tipo de entrada no válido para este festival.")

        # 2. Intentamos realizar el bloqueo seguro (restar en BD)
        exito = self.catalog_dao.bloquear_cupo(id_festival, request.tipo_entrada, request.cantidad)
        if not exito:
            # Si el DAO devuelve False, es que la condición `disponibles >= cantidad` falló
            raise ValueError("NO_STOCK")

        # 3. Devolvemos respuesta exitosa
        return BloqueoCupoResponse(
            bloqueado=True,
            tipo_entrada=request.tipo_entrada,
            precio_unitario=precio_unitario
        )

    def liberar_cupo(self, id_festival: str, request: BloqueoCupoRequest) -> None:
        """Devuelve las entradas al pool si falla el pago (Llamado por el microservicio de Compras)."""
        self.catalog_dao.liberar_cupo(id_festival, request.tipo_entrada, request.cantidad)

    # ==========================================
    # ARTISTAS FAVORITOS
    # ==========================================
    def guardar_favorito(self, user_id: str, request: ArtistaFavoritoRequest) -> ArtistaFavoritoResponse:
        """Guarda un artista favorito para un usuario concreto."""
        nuevo_favorito = ArtistaFavorito.from_request(request, user_id)
        
        self.catalog_dao.add_artista_favorito(
            user_id=nuevo_favorito.user_id,
            id_festival=nuevo_favorito.id_festival,
            nombre_artista=nuevo_favorito.nombre_artista
        )
        
        return nuevo_favorito.to_response_dto()