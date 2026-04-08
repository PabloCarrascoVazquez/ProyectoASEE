import { fetchData } from './api';

export const EventAPI = { 
    getUpcoming: async () => {
        return await fetchData('/events');
    },

    getFullDetails: async (eventId) => {
        return await fetchData(`/events/${eventId}/full`);
    },

    getArtists: async (eventId) => {
        return await fetchData(`/events/${eventId}/artists`);
    },

    getTickets: async (eventId) => {
        return await fetchData(`/events/${eventId}/tickets`);
    }
};