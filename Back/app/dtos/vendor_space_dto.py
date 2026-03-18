from pydantic import BaseModel
from typing import List, Optional

class VendorSpaceResponseDTO(BaseModel):
    id: str
    eventId: str # Usamos camelCase para que tu TypeScript lo lea sin problemas
    name: str
    type: str
    size: str
    location: str
    price: float
    services: List[str] = []
    image: Optional[str] = None
    dimensions: str
    available: bool