from dataclasses import dataclass
from typing import Optional, Dict, Any, List
from datetime import datetime, timezone
import json
import uuid


# Importamos los DTOs que creaste en los pasos anteriores
from app.dtos.requests import AlquilerRequest, ArtistaFavoritoRequest
from app.dtos.responses import (
    FestivalResponse, 
    EspacioResponse, 
    TipoEntradaResponse, 
    AlquilerResponse, 
    ArtistaFavoritoResponse
)

@dataclass
class Festival:
    """Modelo de dominio de Festival."""
    id_festival: str
    nombre: str
    fecha_inicio: str
    fecha_fin: str
    ubicacion: str
    artistas_destacados: List[str]

    @classmethod
    def from_db_row(cls, row: dict) -> "Festival":
        # Manejamos los artistas que vienen de la BD (puede que el DAO ya los haya parseado a lista o no)
        artistas = row.get("artistas_destacados", [])
        if isinstance(artistas, str):
            try:
                artistas = json.loads(artistas)
            except json.JSONDecodeError:
                artistas = []

        return cls(
            id_festival=str(row["id_festival"]),
            nombre=str(row["nombre"]),
            fecha_inicio=str(row["fecha_inicio"]),
            fecha_fin=str(row["fecha_fin"]),
            ubicacion=str(row["ubicacion"]),
            artistas_destacados=artistas
        )

    def to_response_dto(self) -> FestivalResponse:
        return FestivalResponse(
            id_festival=self.id_festival,
            nombre=self.nombre,
            fecha_inicio=self.fecha_inicio,
            fecha_fin=self.fecha_fin,
            ubicacion=self.ubicacion,
            artistas_destacados=self.artistas_destacados
        )

@dataclass
class Espacio:
    """Modelo de dominio de Espacio."""
    id_espacio: str
    id_festival: str
    tipo: str
    metros_cuadrados: int
    precio_alquiler: float
    estado: str

    @classmethod
    def from_db_row(cls, row: dict) -> "Espacio":
        return cls(
            id_espacio=str(row["id_espacio"]),
            id_festival=str(row.get("id_festival", "")),
            tipo=str(row["tipo"]),
            metros_cuadrados=int(row["metros_cuadrados"]),
            precio_alquiler=float(row["precio_alquiler"]),
            estado=str(row["estado"])
        )

    def to_response_dto(self) -> EspacioResponse:
        return EspacioResponse(
            id_espacio=self.id_espacio,
            tipo=self.tipo,
            metros_cuadrados=self.metros_cuadrados,
            precio_alquiler=self.precio_alquiler,
            estado=self.estado
        )

@dataclass
class TipoEntrada:
    """Modelo de dominio de Tipo de Entrada."""
    tipo: str
    precio: float
    disponibles: int

    @classmethod
    def from_db_row(cls, row: dict) -> "TipoEntrada":
        return cls(
            tipo=str(row["tipo"]),
            precio=float(row["precio"]),
            disponibles=int(row["disponibles"])
        )

    def to_response_dto(self) -> TipoEntradaResponse:
        return TipoEntradaResponse(
            tipo=self.tipo,
            precio=self.precio,
            disponibles=self.disponibles
        )

@dataclass
class Alquiler:
    """Modelo de dominio de Alquiler de espacios."""
    id_contrato: str
    id_espacio: str
    nombre_negocio: str
    tipo_negocio: str
    necesita_conexion_electrica: bool
    estado: str
    fecha_solicitud: str

    @classmethod
    def from_alquiler_request(cls, request: AlquilerRequest, id_espacio: str) -> "Alquiler":
        # Generamos el modelo directamente con los datos que pide el Frontend y valores automáticos
        return cls(
            id_contrato=str(uuid.uuid4()),
            id_espacio=id_espacio,
            nombre_negocio=request.nombre_negocio,
            tipo_negocio=request.tipo_negocio,
            necesita_conexion_electrica=request.necesita_conexion_electrica,
            estado="Pendiente de firma",
            fecha_solicitud=datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
        )

    def to_db_dict(self) -> Dict[str, Any]:
        return {
            "id_contrato": self.id_contrato,
            "id_espacio": self.id_espacio,
            "nombre_negocio": self.nombre_negocio,
            "tipo_negocio": self.tipo_negocio,
            "necesita_conexion_electrica": self.necesita_conexion_electrica,
            "estado": self.estado,
            "fecha_solicitud": self.fecha_solicitud
        }

    def to_response_dto(self) -> AlquilerResponse:
        return AlquilerResponse(
            id_contrato=self.id_contrato,
            estado=self.estado,
            fecha_solicitud=self.fecha_solicitud
        )

@dataclass
class ArtistaFavorito:
    """Modelo de dominio de Artista Favorito."""
    user_id: str
    id_festival: str
    nombre_artista: str

    @classmethod
    def from_request(cls, request: ArtistaFavoritoRequest, user_id: str) -> "ArtistaFavorito":
        return cls(
            user_id=user_id,
            id_festival=request.id_festival,
            nombre_artista=request.nombre_artista
        )

    def to_response_dto(self) -> ArtistaFavoritoResponse:
        return ArtistaFavoritoResponse(
            mensaje="Artista añadido a favoritos correctamente.",
            nombre_artista=self.nombre_artista
        )