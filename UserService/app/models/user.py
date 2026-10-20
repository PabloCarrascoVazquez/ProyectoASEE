from dataclasses import dataclass
from typing import Optional, Dict, Any
from app.dtos.requests import UserRegisterRequest, UserUpdateProfileRequest
from app.dtos.responses import UserProfileResponse, TokenResponse


@dataclass
class User:
    """Modelo de dominio de Usuario."""
    id: str
    name: str
    email: str
    password_hash: str
    rol: str = "client"
    avatar: Optional[str] = None

    @classmethod
    def from_register_request(cls, request: UserRegisterRequest, password_hash: str, user_id: str) -> "User":
        return cls(
            id=user_id,
            name=request.name,
            email=request.email,
            password_hash=password_hash,
            rol=request.rol or "client",
            avatar=request.avatar,
        )

    @classmethod
    def from_db_row(cls, row: dict) -> "User":
        return cls(
            id=str(row["id"]),
            name=row["name"],
            email=row["email"],
            password_hash=row["password_hash"],
            rol=row.get("rol", row.get("role", "client")),
            avatar=row.get("avatar"),
        )

    def apply_update_request(self, request: UserUpdateProfileRequest) -> None:
        if request.name is not None:
            self.name = request.name
        if request.avatar is not None:
            self.avatar = request.avatar

    def to_db_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "password_hash": self.password_hash,
            "avatar": self.avatar,
            "rol": self.rol,
        }

    def to_response_dto(self) -> UserProfileResponse:
        return UserProfileResponse(
            id=self.id,
            name=self.name,
            email=self.email,
            avatar=self.avatar,
            rol=self.rol,
        )
