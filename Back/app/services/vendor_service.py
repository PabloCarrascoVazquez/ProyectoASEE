import uuid
from app.daos.factories import DAOFactory

class VendorService:
    def __init__(self):
        self.vendor_dao = DAOFactory.get_vendor_space_dao()
        self.event_dao = DAOFactory.get_event_dao()

    def get_available_spaces_for_event(self, event_id):
        """
        Retorna solo los puestos libres para un evento específico.
        Ideal para el mapa interactivo del frontend.
        """
        event = self.event_dao.get_by_id(event_id)
        if not event:
            raise ValueError(f"El evento con ID {event_id} no existe.")

        spaces = self.vendor_dao.get_by_event_id(event_id)
        
        for space in spaces:
            space['status_text'] = "¡Libre para reservar!" if space['available'] else "Ocupado"
            
        return spaces

    def register_new_vendor_space(self, event_id, name, services_list):
        """
        Crea un nuevo hueco en el recinto.
        """
        if not name or len(name) < 3:
            raise ValueError("El nombre del puesto debe tener al menos 3 caracteres.")

        space_data = {
            "id": str(uuid.uuid4()),
            "event_id": event_id,
            "name": name,
            "available": True,
            "services": services_list if services_list else []
        }

        try:
            self.vendor_dao.create(space_data)
            return space_data
        except Exception as e:
            raise Exception(f"Error al registrar el espacio: {str(e)}")

    def toggle_space_availability(self, space_id, is_available):
        """
        Cambia el estado de un puesto (Útil para administración).
        """
        return self.vendor_dao.update_availability(space_id, is_available)

    def get_all_spaces(self):
        """Retorna todos los puestos registrados."""
        return self.vendor_dao.get_all()

    def create_space(self, data):
        """Crea un hueco a partir de un diccionario (con id opcional)."""
        if not data.get('event_id'):
            raise ValueError("El puesto debe estar asociado a un evento (event_id).")
        if not data.get('name') or len(data['name']) < 3:
            raise ValueError("El nombre del puesto debe tener al menos 3 caracteres.")

        space_data = {
            "id": data.get('id') or str(uuid.uuid4()),
            "event_id": data['event_id'],
            "name": data['name'],
            "available": data.get('available', True),
            "services": data.get('services', [])
        }
        self.vendor_dao.create(space_data)
        return space_data

    def delete_space(self, space_id):
        return self.vendor_dao.delete(space_id)

    def reserve_space(self, space_id):
        """Un vendor marca un puesto como ocupado (reservado)."""
        space = self.vendor_dao.get_by_id(space_id)
        if not space:
            raise ValueError("El puesto no existe.")
        if not space.get('available'):
            raise ValueError("El puesto ya no está disponible.")
        self.vendor_dao.update_availability(space_id, False)
        return self.vendor_dao.get_by_id(space_id)