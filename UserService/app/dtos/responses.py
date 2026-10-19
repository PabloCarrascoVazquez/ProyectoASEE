from dataclasses import dataclass
from typing import Optional, Dict, Any


@dataclass
class UserProfileResponse:
    """DTO de salida con los datos públicos del usuario (sin contraseña)."""
    id: str
    name: str
    email: str
    rol: str
    avatar: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "avatar": self.avatar,
            "rol": self.rol,
        }


@dataclass
class TokenResponse:
    """DTO de salida devuelto tras un inicio de sesión correcto."""
    access_token: str
    user: UserProfileResponse
    token_type: str = "bearer"

    def to_dict(self) -> Dict[str, Any]:
        return {
            "access_token": self.access_token,
            "token_type": self.token_type,
            "user": self.user.to_dict() if self.user else None,
        }