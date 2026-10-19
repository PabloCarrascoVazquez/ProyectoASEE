from dataclasses import dataclass
from typing import Optional


@dataclass
class UserRegisterRequest:
    """DTO de entrada para registrar un nuevo usuario."""
    name: str
    email: str
    password: str
    avatar: Optional[str] = None
    rol: str = "client"

    @classmethod
    def from_dict(cls, data: dict) -> "UserRegisterRequest":
        return cls(
            name=data.get("name"),
            email=data.get("email"),
            password=data.get("password"),
            avatar=data.get("avatar"),
            rol=data.get("rol", "client"),
        )


@dataclass
class UserLoginRequest:
    """DTO de entrada para inicio de sesión."""
    email: str
    password: str

    @classmethod
    def from_dict(cls, data: dict) -> "UserLoginRequest":
        return cls(
            email=data.get("email"),
            password=data.get("password"),
        )


@dataclass
class UserUpdateProfileRequest:
    """DTO de entrada para modificar perfil (nombre y/o avatar)."""
    name: Optional[str] = None
    avatar: Optional[str] = None

    @classmethod
    def from_dict(cls, data: dict) -> "UserUpdateProfileRequest":
        return cls(
            name=data.get("name"),
            avatar=data.get("avatar"),
        )