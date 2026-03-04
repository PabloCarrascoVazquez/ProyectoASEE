import { Event, mockEvents } from '../data/mockData';

const STORAGE_KEY = 'subsonic_events';
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// Auxiliar para leer de localStorage o fallback al mock
const getStoredEvents = (): Event[] => {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : mockEvents;
};

export const eventService = {
  // GET: Obtener todos los eventos
  getAll: async (): Promise<Event[]> => {
    await delay(500);
    return getStoredEvents();
  },

  // POST: Crear un evento
  create: async (newEvent: Event): Promise<Event> => {
    await delay(800);
    const events = getStoredEvents();
    const updatedEvents = [newEvent, ...events];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEvents));
    return newEvent;
  },

  // DELETE: Eliminar un evento
  delete: async (id: string): Promise<boolean> => {
    await delay(500);
    const events = getStoredEvents();
    const filtered = events.filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  }
};