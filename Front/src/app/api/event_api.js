import { fetchData } from './api';

export const EventAPI = { 
    // Obtiene la lista simple de eventos
    getAll: async () => {
        return await fetchData('/events');
    },

    // Obtiene los detalles completos
    getFullDetails: async (eventId) => { // <-- Limpio de tipos
        return await fetchData(`/events/${eventId}/full`);
    },

    // Crea un evento
    create: async (payload) => {
        return await fetchData('/events', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    },

    // Borra un evento
    delete: async (eventId) => {
        return await fetchData(`/events/${eventId}`, {
            method: 'DELETE'
        });
    },

    getArtists: async (eventId) => {
        return await fetchData(`/events/${eventId}/artists`);
    },

    getTickets: async (eventId) => {
        return await fetchData(`/events/${eventId}/tickets`);
    }
};