from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

# --- DTOs de Entrada (Lo que el frontend envía al backend) ---

class UserRegisterRequestDTO(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr # Valida automáticamente que sea un formato email@dominio.com
    password: str = Field(..., min_length=8, description="Contraseña en texto plano")
    avatar: Optional[str] = None

class UserLoginRequestDTO(BaseModel):
    email: EmailStr
    password: str

class UpdateLocationRequestDTO(BaseModel):
    x: float = Field(..., ge=-180.0, le=180.0) # Longitud
    y: float = Field(..., ge=-90.0, le=90.0)   # Latitud

# --- DTOs de Salida (Lo que el backend envía al frontend) ---

class PositionDTO(BaseModel):
    x: float
    y: float

class FriendResponseDTO(BaseModel):
    """Corresponde exactamente a tu interfaz 'Friend' en TypeScript"""
    id: str
    name: str
    position: Optional[PositionDTO] = None
    avatar: Optional[str] = None
    # NOTA ARQUITECTÓNICA: NUNCA incluimos el password_hash aquí.

class UserTicketResponseDTO(BaseModel):
    """Lo que el usuario ve en su Vista 5: Perfil (Entradas compradas)"""
    ticket_id: str
    purchase_date: datetime
    status: str
    ticket_type: str
    price: float
    event_id: str
    event_name: str
    event_date: datetime
    event_image: Optional[str] = None

class UserProfileResponseDTO(FriendResponseDTO):
    """El perfil completo del usuario, heredando de Friend y añadiendo sus entradas"""
    email: str
    tickets: List[UserTicketResponseDTO] = []