from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

# --- DTOs de Entrada (Lo que el frontend envía al backend) ---

class UserRegisterRequestDTO(BaseModel): # <--- Añadido
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr 
    password: str = Field(..., min_length=8, description="Contraseña en texto plano")
    avatar: Optional[str] = None

class UserLoginRequestDTO(BaseModel): # <--- Añadido
    email: EmailStr
    password: str


class UserTicketResponseDTO(BaseModel): # <--- Añadido
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


class UserMerchandiseResponseDTO(BaseModel):
    id: str
    name: str
    price: float
    image: Optional[str] = None
    category: str
    # --- Añadidos para el historial de compras ---
    quantity: Optional[int] = None       # Cuántos compró
    total_price: Optional[float] = None  # Cantidad * Precio
    status: Optional[str] = None        # 'PENDING', 'SHIPPED', etc.
    purchase_date: Optional[str] = None  # Cuándo se compró