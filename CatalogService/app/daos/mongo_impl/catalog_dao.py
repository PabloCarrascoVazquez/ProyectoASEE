import uuid
from typing import List
from pymongo import ReturnDocument
from pymongo.database import Database
from app.daos.interfaces import ICatalogDAO


class CatalogDAOMongo(ICatalogDAO):
    def __init__(self, db: Database):
        self.db = db
        self.festivales = db["festivales"]
        self.alquileres = db["alquileres"]
        self.artistas_favoritos = db["artistas_favoritos"]
        self.artistas = db["artistas"]
        self._ensure_indexes()

    def _ensure_indexes(self):
        """Crea índices únicos y de búsqueda rápida si no existen."""
        self.festivales.create_index("id_festival", unique=True)
        self.festivales.create_index("espacios.id_espacio")
        self.alquileres.create_index("id_contrato", unique=True)
        self.alquileres.create_index("id_espacio")
        self.artistas_favoritos.create_index(
            [("user_id", 1), ("id_festival", 1), ("nombre_artista", 1)],
            unique=True
        )

    # ==========================================
    # FESTIVALES
    # ==========================================
    def get_all_festivales(self) -> List[dict]:
        """Recupera la lista de todos los festivales disponibles."""
        cursor = self.festivales.find(
            {},
            {
                "_id": 0,
                "id_festival": 1,
                "nombre": 1,
                "fecha_inicio": 1,
                "fecha_fin": 1,
                "ubicacion": 1,
                "artistas_destacados": 1,
            },
        )
        festivales = []
        for doc in cursor:
            doc.setdefault("artistas_destacados", [])
            festivales.append(doc)
        return festivales

    def create_festival(self, festival_data: dict) -> str:
        """Inserta un nuevo documento de festival en MongoDB."""
        id_festival = festival_data.get("id_festival")
        if not id_festival:
            id_festival = f"fest_{uuid.uuid4().hex[:8]}"
            festival_data["id_festival"] = id_festival

        documento = {
            "id_festival": id_festival,
            "nombre": festival_data.get("nombre"),
            "fecha_inicio": festival_data.get("fecha_inicio"),
            "fecha_fin": festival_data.get("fecha_fin"),
            "ubicacion": festival_data.get("ubicacion"),
            "artistas_destacados": list(festival_data.get("artistas_destacados", [])),
            "espacios": list(festival_data.get("espacios", [])),
            "tipos_entrada": list(festival_data.get("tipos_entrada", [])),
        }
        self.festivales.insert_one(documento)
        return id_festival

    def update_festival(self, id_festival: str, festival_data: dict) -> bool:
        """Actualiza los metadatos principales de un festival."""
        result = self.festivales.update_one(
            {"id_festival": id_festival},
            {
                "$set": {
                    "nombre": festival_data.get("nombre"),
                    "fecha_inicio": festival_data.get("fecha_inicio"),
                    "fecha_fin": festival_data.get("fecha_fin"),
                    "ubicacion": festival_data.get("ubicacion"),
                }
            },
        )
        return result.matched_count > 0

    def delete_festival(self, id_festival: str) -> bool:
        """Elimina un festival y todos sus subdocumentos embebidos."""
        result = self.festivales.delete_one({"id_festival": id_festival})
        return result.deleted_count > 0

    # ==========================================
    # ESPACIOS Y ALQUILERES
    # ==========================================
    def get_espacios_by_festival(self, id_festival: str) -> List[dict]:
        """Recupera las parcelas embebidas de un festival concreto."""
        doc = self.festivales.find_one(
            {"id_festival": id_festival},
            {"_id": 0, "espacios": 1},
        )
        if not doc:
            return []
        return doc.get("espacios", [])

    def create_espacio(self, id_festival: str, espacio_data: dict) -> bool:
        """Añade un espacio embebido dentro del array 'espacios' del festival."""
        id_espacio = espacio_data.get("id_espacio") or f"esp-{uuid.uuid4().hex[:8]}"
        nuevo_espacio = {
            "id_espacio": id_espacio,
            "tipo": espacio_data.get("tipo"),
            "metros_cuadrados": espacio_data.get("metros_cuadrados", 0),
            "precio_alquiler": espacio_data.get("precio_alquiler"),
            "estado": "disponible",
        }
        result = self.festivales.update_one(
            {"id_festival": id_festival},
            {"$push": {"espacios": nuevo_espacio}},
        )
        return result.matched_count > 0

    def create_alquiler(self, alquiler_data: dict) -> bool:
        """Registra un contrato de alquiler y marca el espacio embebido como 'alquilado'."""
        contrato = {
            "id_contrato": alquiler_data["id_contrato"],
            "id_espacio": alquiler_data["id_espacio"],
            "nombre_negocio": alquiler_data["nombre_negocio"],
            "tipo_negocio": alquiler_data["tipo_negocio"],
            "necesita_conexion_electrica": bool(alquiler_data["necesita_conexion_electrica"]),
            "estado": alquiler_data["estado"],
            "fecha_solicitud": str(alquiler_data["fecha_solicitud"]),
        }
        self.alquileres.insert_one(contrato)

        self.festivales.update_one(
            {"espacios.id_espacio": alquiler_data["id_espacio"]},
            {"$set": {"espacios.$.estado": "alquilado"}},
        )
        return True

    def cancelar_alquiler(self, id_espacio: str) -> bool:
        """Libera el espacio embebido a 'disponible' y marca el contrato como 'Cancelado'."""
        self.festivales.update_one(
            {"espacios.id_espacio": id_espacio},
            {"$set": {"espacios.$.estado": "disponible"}},
        )
        self.alquileres.update_many(
            {"id_espacio": id_espacio},
            {"$set": {"estado": "Cancelado"}},
        )
        return True

    # ==========================================
    # ENTRADAS
    # ==========================================
    def get_entradas_by_festival(self, id_festival: str) -> List[dict]:
        """Recupera los tipos de entrada y stock disponible embebidos en el festival."""
        doc = self.festivales.find_one(
            {"id_festival": id_festival},
            {"_id": 0, "tipos_entrada": 1},
        )
        if not doc:
            return []
        return doc.get("tipos_entrada", [])

    def create_entradas(self, id_festival: str, entradas_data: dict) -> bool:
        """Añade un tipo de entrada embebido en el festival."""
        nueva_entrada = {
            "tipo": entradas_data.get("tipo"),
            "precio": entradas_data.get("precio"),
            "disponibles": entradas_data.get("disponibles"),
        }
        result = self.festivales.update_one(
            {"id_festival": id_festival},
            {"$push": {"tipos_entrada": nueva_entrada}},
        )
        return result.matched_count > 0

    def bloquear_cupo(self, id_festival: str, tipo_entrada: str, cantidad: int) -> bool:
        """Descuenta atómicamente el stock disponible solo si disponibles >= cantidad."""
        result = self.festivales.update_one(
            {
                "id_festival": id_festival,
                "tipos_entrada": {
                    "$elemMatch": {
                        "tipo": tipo_entrada,
                        "disponibles": {"$gte": cantidad},
                    }
                },
            },
            {"$inc": {"tipos_entrada.$.disponibles": -cantidad}},
        )
        return result.modified_count > 0

    def liberar_cupo(self, id_festival: str, tipo_entrada: str, cantidad: int) -> bool:
        """Devuelve atómicamente la cantidad liberada al stock disponible."""
        result = self.festivales.update_one(
            {
                "id_festival": id_festival,
                "tipos_entrada.tipo": tipo_entrada,
            },
            {"$inc": {"tipos_entrada.$.disponibles": cantidad}},
        )
        return result.modified_count > 0

    def confirmar_cupo(self, id_festival: str, tipo_entrada: str, cantidad: int) -> bool:
        """Consolida definitivamente la venta de entradas tras el pago."""
        return self.bloquear_cupo(id_festival, tipo_entrada, cantidad)

    # ==========================================
    # ARTISTAS FAVORITOS
    # ==========================================
    def add_artista_favorito(self, user_id: str, id_festival: str, nombre_artista: str) -> bool:
        """Añade un artista a la lista de favoritos de un usuario."""
        self.artistas_favoritos.insert_one(
            {
                "user_id": user_id,
                "id_festival": id_festival,
                "nombre_artista": nombre_artista,
            }
        )
        return True

    # ==========================================
    # ARTISTAS
    # ==========================================
    def create_artista(self, artista_data: dict) -> int:
        """Registra un nuevo artista en MongoDB y devuelve un ID numérico autoincremental."""
        counter = self.db["counters"].find_one_and_update(
            {"_id": "artistas_id"},
            {"$inc": {"seq": 1}},
            upsert=True,
            return_document=ReturnDocument.AFTER,
        )
        artista_id = int(counter["seq"])
        self.artistas.insert_one(
            {
                "id": artista_id,
                "nombre": artista_data.get("nombre"),
                "genero": artista_data.get("genero"),
                "popularidad": artista_data.get("popularidad", 0),
            }
        )
        return artista_id