import { Event, mockEvents } from '../data/mockData';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// --- BASE DE DATOS EN MEMORIA ---
// Se inicializa con los datos frescos de mockData.ts en cada carga de página.
let eventsDB = [...mockEvents];

export const eventService = {
  // GET: Obtener todos los eventos
  getAll: async (): Promise<Event[]> => {
    await delay(500);
    // Retornamos la lista actual en memoria
    return eventsDB;
  },

  // POST: Crear un evento (Persiste solo hasta que se recargue la página)
  create: async (newEvent: Event): Promise<Event> => {
    await delay(800);
    // Añadimos al inicio para que aparezca primero en el feed
    eventsDB = [newEvent, ...eventsDB];
    return newEvent;
  },

  // DELETE: Eliminar un evento (Persiste solo hasta que se recargue la página)
  delete: async (id: string): Promise<boolean> => {
    await delay(500);
    // Filtramos la variable de memoria
    eventsDB = eventsDB.filter(e => e.id !== id);
    return true;
  }
};