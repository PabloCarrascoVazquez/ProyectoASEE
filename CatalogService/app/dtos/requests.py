from dataclasses import dataclass
from typing import Optional

@dataclass
class BloqueoCupoRequest:
    """DTO de entrada para bloquear temporalmente el cupo de entradas."""
    tipo_entrada: str
    cantidad: int = 1

    @classmethod
    def from_dict(cls, data: dict) -> "BloqueoCupoRequest":
        return cls(
            tipo_entrada=data.get("tipo_entrada"),
            cantidad=data.get("cantidad", 1)  # 1 por defecto según tu YAML
        )

@dataclass
class AlquilerRequest:
    """DTO de entrada para solicitar el alquiler de un espacio/parcela."""
    nombre_negocio: str
    tipo_negocio: str
    necesita_conexion_electrica: bool = False

    @classmethod
    def from_dict(cls, data: dict) -> "AlquilerRequest":
        return cls(
            nombre_negocio=data.get("nombre_negocio"),
            tipo_negocio=data.get("tipo_negocio"),
            necesita_conexion_electrica=data.get("necesita_conexion_electrica", False)
        )

@dataclass
class ArtistaFavoritoRequest:
    """DTO de entrada para añadir un artista a la lista de favoritos."""
    id_festival: str
    nombre_artista: str

    @classmethod
    def from_dict(cls, data: dict) -> "ArtistaFavoritoRequest":
        return cls(
            id_festival=data.get("id_festival"),
            nombre_artista=data.get("nombre_artista")
        )