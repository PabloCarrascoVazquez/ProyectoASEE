import { useState } from 'react';
import { Event, mockEvents } from '../app/data/mockData';

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>(() => {
    // Intentamos leer de LocalStorage primero
    const saved = localStorage.getItem('subsonic_events');
    return saved ? JSON.parse(saved) : mockEvents;
  });

  // Función para actualizar eventos desde cualquier sitio
  const updateEvents = (newEvents: Event[]) => {
    setEvents(newEvents);
    localStorage.setItem('subsonic_events', JSON.stringify(newEvents));
  };

  return { events, updateEvents };
};