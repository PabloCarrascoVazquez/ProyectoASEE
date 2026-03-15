from pydantic import BaseModel
from typing import Optional

class MerchandiseResponseDTO<:
    id: str
    name: str
    price: float
    image: Optional[str] = None
    category: str