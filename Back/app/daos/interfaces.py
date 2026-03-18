from abc import ABC, abstractmethod
from typing import List, Dict, Optional

# ==========================================
# CONTRATOS DE ACCESO A DATOS (INTERFACES)
# ==========================================

class IUserDAO(ABC):
    @abstractmethod
    def create(self, user_data: dict) -> str: pass
    
    @abstractmethod
    def get_by_email(self, email: str) -> Optional[dict]: pass

class IEventDAO(ABC):
    @abstractmethod
    def create(self, event_data: dict) -> str: pass
    
    @abstractmethod
    def get_by_id(self, event_id: str) -> Optional[dict]: pass
    
    @abstractmethod
    def get_all(self) -> List[dict]: pass

class IArtistDAO(ABC):
    @abstractmethod
    def create(self, artist_data: dict) -> str: pass
    
    @abstractmethod
    def get_all(self) -> List[dict]: pass
    
    @abstractmethod
    def get_by_event_id(self, event_id: str) -> List[dict]: pass

class ITicketDAO(ABC):
    @abstractmethod
    def create(self, ticket_data: dict) -> str: pass
    
    @abstractmethod
    def get_by_event_id(self, event_id: str) -> List[dict]: pass

class IVendorDAO(ABC):
    @abstractmethod
    def get_by_event_id(self, event_id: str) -> List[dict]: pass

class IUserTicketDAO(ABC):
    @abstractmethod
    def create(self, ticket_data: dict) -> str: pass
    
    @abstractmethod
    def get_by_user_id(self, user_id: str) -> List[dict]: pass
    
    @abstractmethod
    def get_by_id(self, ticket_instance_id: str) -> Optional[dict]: pass
    
    @abstractmethod
    def update_status(self, ticket_instance_id: str, new_status: str) -> bool: pass


class IMerchandiseDAO(ABC):
    @abstractmethod
    def create(self, merch_data: dict) -> str: pass
    
    @abstractmethod
    def get_all(self) -> List[dict]: pass

    @abstractmethod
    def get_by_category(self, category: str) -> List[dict]: pass