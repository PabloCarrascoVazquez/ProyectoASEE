import { EventAPI } from '../api/event_api';
import { AdminAPI } from '../api/admin_api';
import { Event } from '../models/interfaces';

export const eventService = {
  /**
   * Lista todos los eventos (público, no requiere token).
   */
  getAll: async () => {
    try {
      const response = await fetch('http://localhost:5000/api/events');
      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error en el servicio de eventos:", error);
      return [];
    }
  },

  /**
   * Detalle completo de un evento (público).
   */
  getEventFull: async (id: string): Promise<Event> => {
    try {
      const response = await EventAPI.getFullDetails(id);
      return response;
    } catch (error) {
      console.error(`Error al cargar el detalle del evento ${id}:`, error);
      throw error;
    }
  },

  /**
   * Crea un evento en el backend. Requiere token admin (lo inyecta fetchData).
   */
  create: async (newEvent: Event): Promise<Event> => {
    const payload = {
      id: newEvent.id,
      name: newEvent.name,
      date: newEvent.date,
      description: newEvent.description,
      image: newEvent.image,
      services: newEvent.services || [],
      gallery: newEvent.gallery || [],
      mapImage: newEvent.mapImage || ''
    };
    const saved = await AdminAPI.createEvent(payload);
    return { ...newEvent, ...saved };
  },

  /**
   * Borra un evento. Requiere token admin.
   */
  delete: async (id: string): Promise<boolean> => {
    await AdminAPI.deleteEvent(id);
    return true;
  }
};
