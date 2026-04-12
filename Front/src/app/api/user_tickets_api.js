import { fetchData } from './api';

export const UserTicketsAPI = {
    /**
     * Obtiene el listado de entradas compradas por el usuario actual
     * El backend usa el decorador @token_required para identificar al usuario
     */
    getMyTickets: async () => {
        return await fetchData('/user/tickets');
    },

    /**
     * Opcional: Cancelar una entrada si tu backend lo permite
     */
    cancelTicket: async (ticketId) => {
        return await fetchData(`/user/tickets/${ticketId}`, {
            method: 'DELETE'
        });
    }
};