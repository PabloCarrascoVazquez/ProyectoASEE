import { EventAPI } from '../api/event_api';
import { Event } from '../models/interfaces';

export const eventService = {
  /**
   * Lista todos los eventos.
   */
  getAll: async (): Promise<Event[]> => {
    try {
      return await EventAPI.getAll();
    } catch (error) {
      console.error("Error en el service al listar eventos:", error);
      return [];
    }
  },

  /**
   * Detalle completo de un evento.
   */
  getEventFull: async (id: string): Promise<Event> => {
    try {
      return await EventAPI.getFullDetails(id);
    } catch (error) {
      console.error(`Error en el service al obtener detalle del evento ${id}:`, error);
      throw error;
    }
  },

  /**
   * Crea un evento delegando en la API.
   */
  create: async (newEvent: Event): Promise<Event> => {
    try {
      // Mantenemos la preparación del objeto si el backend espera un formato concreto
      const payload = {
        name: newEvent.name,
        date: newEvent.date,
        description: newEvent.description,
        image: newEvent.image,
        services: newEvent.services || [],
        gallery: newEvent.gallery || [],
        mapImage: newEvent.mapImage || ''
      };
      return await EventAPI.create(payload);
    } catch (error) {
      console.error("Error en el service al crear evento:", error);
      throw error;
    }
  },

  /**
   * Borra un evento delegando en la API.
   */
  delete: async (id: string): Promise<boolean> => {
    try {
      await EventAPI.delete(id);
      return true;
    } catch (error) {
      console.error(`Error en el service al borrar evento ${id}:`, error);
      return false;
    }
  }
};