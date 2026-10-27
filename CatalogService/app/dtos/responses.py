from dataclasses import dataclass
from typing import Optional, Dict, Any, List

@dataclass
class FestivalResponse:
    """DTO de salida con la información detallada de un festival."""
    id_festival: str
    nombre: str
    fecha_inicio: str
    fecha_fin: str
    ubicacion: str
    artistas_destacados: List[str]

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id_festival": self.id_festival,
            "nombre": self.nombre,
            "fecha_inicio": self.fecha_inicio,
            "fecha_fin": self.fecha_fin,
            "ubicacion": self.ubicacion,
            "artistas_destacados": self.artistas_destacados,
        }

@dataclass
class EspacioResponse:
    """DTO de salida con los detalles de una parcela/espacio."""
    id_espacio: str
    tipo: str
    metros_cuadrados: int
    precio_alquiler: float
    estado: str

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id_espacio": self.id_espacio,
            "tipo": self.tipo,
            "metros_cuadrados": self.metros_cuadrados,
            "precio_alquiler": self.precio_alquiler,
            "estado": self.estado,
        }

@dataclass
class TipoEntradaResponse:
    """DTO de salida para la disponibilidad de entradas."""
    tipo: str
    precio: float
    disponibles: int

    def to_dict(self) -> Dict[str, Any]:
        return {
            "tipo": self.tipo,
            "precio": self.precio,
            "disponibles": self.disponibles,
        }

@dataclass
class BloqueoCupoResponse:
    """DTO de salida tras intentar bloquear cupo desde el Servicio de Compras."""
    bloqueado: bool
    tipo_entrada: str
    precio_unitario: float

    def to_dict(self) -> Dict[str, Any]:
        return {
            "bloqueado": self.bloqueado,
            "tipo_entrada": self.tipo_entrada,
            "precio_unitario": self.precio_unitario,
        }

@dataclass
class AlquilerResponse:
    """DTO de salida tras registrar un contrato de alquiler de espacio."""
    id_contrato: str
    estado: str
    fecha_solicitud: str

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id_contrato": self.id_contrato,
            "estado": self.estado,
            "fecha_solicitud": self.fecha_solicitud,
        }

@dataclass
class ArtistaFavoritoResponse:
    """DTO de salida al añadir correctamente un artista a favoritos."""
    mensaje: str
    nombre_artista: str

    def to_dict(self) -> Dict[str, Any]:
        return {
            "mensaje": self.mensaje,
            "nombre_artista": self.nombre_artista,
        }

@dataclass
class ErrorResponse:
    """DTO genérico para respuestas de error (400, 404, 500, etc.)."""
    codigo: int
    mensaje: str
    detalle: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "codigo": self.codigo,
            "mensaje": self.mensaje,
            "detalle": self.detalle,
        }