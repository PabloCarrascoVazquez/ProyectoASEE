from dataclasses import dataclass
from typing import Optional
from dto.User import User 


@dataclass
class TokenDTO:
    """DTO para la respuesta tras un login exitoso."""
    access_token: str
    token_type: str = "bearer"
    expires_in: int = 3600  # duración en segundos
    user: Optional[User] = None

    def to_dict(self):
        return {
            "access_token": self.access_token,
            "token_type": self.token_type,
            "expires_in": self.expires_in,
            "user": self.user.to_dict() if self.user else None
        }