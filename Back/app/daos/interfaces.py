from abc import ABC, abstractmethod
from typing import List, Dict, Optional

class IUserDAO(ABC):
    @abstractmethod
    def create(self, user_data: dict) -> str: pass
    
    @abstractmethod
    def get_by_email(self, email: str) -> Optional[dict]: pass
    
    @abstractmethod
    def get_user_tickets(self, user_id: str) -> List[dict]: pass

class IEventDAO(ABC):
    @abstractmethod
    def create(self, event_data: dict) -> str: pass
    
    @abstractmethod
    def get_by_id(self, event_id: str) -> Optional[dict]: pass
    
    @abstractmethod
    def get_all(self) -> List[dict]: pass
