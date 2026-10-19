from abc import ABC, abstractmethod
from typing import List, Dict, Optional, Any

class IUserDAO(ABC):
    @abstractmethod
    def create(self, user_data: dict) -> str:
        """Crea un usuario y retorna su ID."""
        pass

    @abstractmethod
    def get_by_email(self, email: str) -> Optional[dict]:
        """Obtiene un usuario por su email."""
        pass

    @abstractmethod
    def get_by_id(self, user_id: str) -> Optional[dict]:
        """Obtiene un usuario por su ID."""
        pass

    @abstractmethod
    def update(self, user_id: str, fields: dict) -> bool:
        """Actualiza campos específicos del usuario."""
        pass

    @abstractmethod
    def delete(self, user_id: str) -> bool:
        """Elimina un usuario por su ID."""
        pass

