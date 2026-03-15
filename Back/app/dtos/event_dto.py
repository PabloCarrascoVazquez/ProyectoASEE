from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# 1. DTO para los Artistas
class ArtistDTO:
    id: str
    name: str
    genre: str
    image: Optional[str] = None
    spotifyUrl: Optional[str] = None

# 2. DTO para las Entradas
class TicketPriceDTO:
    id: str
    type: str
    price: float
    description: Optional[str] = None
    features: List[str] = []

# 3. DTO Masivo para el Detalle del Evento (Lo que recibe la Vista 2)
class EventDetailResponseDTO:
    id: str
    name: str
    date: datetime
    image: Optional[str] = None
    description: str
    services: List[str] = []
    gallery: List[str] = []
    mapImage: Optional[str] = None
    
    # Aquí anidamos los otros DTOs (¡Magia de Pydantic!)
    artists: List[ArtistDTO] = []
    ticketPrices: List[TicketPriceDTO] = []