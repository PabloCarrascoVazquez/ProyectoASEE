from abc import ABC, abstractmethod
from typing import List, Dict, Optional, Any

class ICatalogDAO(ABC):
    
    # ==========================================
    # FESTIVALES
    # ==========================================
    @abstractmethod
    def get_all_festivales(self) -> List[dict]:
        """Recupera la lista de todos los festivales disponibles."""
        pass

    # ==========================================
    # ESPACIOS Y ALQUILERES
    # ==========================================
    @abstractmethod
    def get_espacios_by_festival(self, id_festival: str) -> List[dict]:
        """Recupera las parcelas/espacios de un festival concreto."""
        pass

    @abstractmethod
    def create_alquiler(self, alquiler_data: dict) -> bool:
        """Registra un nuevo contrato de alquiler para un espacio."""
        pass

    # ==========================================
    # ENTRADAS
    # ==========================================
    @abstractmethod
    def get_entradas_by_festival(self, id_festival: str) -> List[dict]:
        """Recupera los tipos de entrada y stock disponible para un festival."""
        pass

    @abstractmethod
    def bloquear_cupo(self, id_festival: str, tipo_entrada: str, cantidad: int) -> bool:
        """Resta la cantidad del stock disponible (si hay suficiente)."""
        pass

    @abstractmethod
    def liberar_cupo(self, id_festival: str, tipo_entrada: str, cantidad: int) -> bool:
        """Suma la cantidad devuelta al stock disponible."""
        pass

    # ==========================================
    # ARTISTAS FAVORITOS
    # ==========================================
    @abstractmethod
    def add_artista_favorito(self, user_id: str, id_festival: str, nombre_artista: str) -> bool:
        """Añade un artista a la lista de favoritos de un usuario."""
        pass