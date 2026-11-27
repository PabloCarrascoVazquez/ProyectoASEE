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

    @abstractmethod
    def create_festival(self, festival_data: dict) -> str:
        """Inserta un nuevo festival en la base de datos y devuelve su ID."""
        pass

    @abstractmethod
    def update_festival(self, id_festival: str, festival_data: dict) -> bool:
        pass

    @abstractmethod
    def delete_festival(self, id_festival: str) -> bool:
        pass

    # ==========================================
    # ESPACIOS Y ALQUILERES
    # ==========================================
    @abstractmethod
    def get_espacios_by_festival(self, id_festival: str) -> List[dict]:
        """Recupera las parcelas/espacios de un festival concreto."""
        pass

    @abstractmethod
    def create_espacio(self, id_festival: str, espacio_data: dict) -> bool:
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
    def create_entradas(self, id_festival: str, entradas_data: dict) -> bool:
        pass

    @abstractmethod
    def bloquear_cupo(self, id_festival: str, tipo_entrada: str, cantidad: int) -> bool:
        """Resta la cantidad del stock disponible (si hay suficiente)."""
        pass

    @abstractmethod
    def liberar_cupo(self, id_festival: str, tipo_entrada: str, cantidad: int) -> bool:
        """Suma la cantidad devuelta al stock disponible."""
        pass

    @abstractmethod
    def confirmar_cupo(self, id_festival: str, tipo_entrada: str, cantidad: int) -> bool:
        """Consolida definitivamente la venta de entradas tras el pago."""
        pass

    # ==========================================
    # ARTISTAS FAVORITOS
    # ==========================================
    @abstractmethod
    def add_artista_favorito(self, user_id: str, id_festival: str, nombre_artista: str) -> bool:
        """Añade un artista a la lista de favoritos de un usuario."""
        pass

    # ==========================================
    # ARTISTAS
    # ==========================================
    @abstractmethod
    def create_artista(self, artista_data: dict) -> int:
        """Registra un nuevo artista en el catálogo general y devuelve su ID."""
        pass