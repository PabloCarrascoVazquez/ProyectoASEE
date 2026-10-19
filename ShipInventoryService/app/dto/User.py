from dataclasses import dataclass
from typing import Optional, Dict, Any


@dataclass
class UserDTO:
    """Modelo / DTO de Usuario que mapea las columnas de la tabla SQL."""
    id: str
    name: str
    email: str
    password_hash: str
    avatar: Optional[str] = None
    rol: str = "client"  # admin, client, supplier

    def to_dict(self) -> Dict[str, Any]:
        """Convierte los datos a un diccionario (ej. para enviar en respuestas JSON)."""
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "avatar": self.avatar,
            "rol": self.rol
        }