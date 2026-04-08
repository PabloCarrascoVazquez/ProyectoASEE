import { EventAPI } from '../api/event_api';
import { Event } from '../models/interfaces';

export const eventService = {
  getAll: async () => {
    try {
      const response = await fetch('http://localhost:5000/api/events');
      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor');
      }
      const data = await response.json();
      
      return data; // Esto DEBE devolver el array [...]
    } catch (error) {
      console.error("Error en el servicio de eventos:", error);
      return []; // Devolvemos array vacío en caso de error para que no sea 'undefined'
    }
  },

  /**
   * Obtiene el "Mega-Combo" para la página de detalle.
   * Gracias al mapeo en el Backend, el JSON ya cumple con la interfaz Event.
   */
  getEventFull: async (id: string): Promise<Event> => {
    try {
      // Llamamos al endpoint /api/events/<id>/full
      const response = await EventAPI.getFullDetails(id);
      
      // Retornamos el objeto tal cual, ya que el Backend se encargó 
      // de renombrar ticket_options -> ticketPrices, etc.
      return response; 
    } catch (error) {
      console.error(`Error al cargar el detalle del evento ${id}:`, error);
      throw error; // Re-lanzamos para que la UI pueda mostrar un mensaje de error
    }
  },

  /**
   * Por ahora mantenemos la firma del método para no romper el Front,
   * pero avisamos que el Backend aún no procesa el guardado.
   */
  create: async (newEvent: Event): Promise<Event> => {
    console.warn("Backend: Endpoint POST /api/events no implementado aún.");
    // Simulación de éxito para no romper el flujo del Front
    return newEvent;
  }
};