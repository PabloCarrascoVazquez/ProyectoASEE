import { fetchData } from './api';

/**
 * Todas estas rutas requieren un token JWT de un usuario con rol 'admin'.
 * El token lo inyecta automáticamente fetchData (desde localStorage).
 */
export const AdminAPI = {
    // -------- EVENTOS --------
    createEvent: async (eventPayload) => {
        return await fetchData('/admin/events', {
            method: 'POST',
            body: JSON.stringify(eventPayload)
        });
    },
    deleteEvent: async (eventId) => {
        return await fetchData(`/admin/events/${eventId}`, {
            method: 'DELETE'
        });
    },

    // -------- MERCHANDISING --------
    createMerch: async (merchPayload) => {
        return await fetchData('/admin/merchandise', {
            method: 'POST',
            body: JSON.stringify(merchPayload)
        });
    },
    deleteMerch: async (merchId) => {
        return await fetchData(`/admin/merchandise/${merchId}`, {
            method: 'DELETE'
        });
    },

    // -------- VENDOR SPACES --------
    listVendorSpaces: async () => {
        return await fetchData('/admin/vendor-spaces');
    },
    createVendorSpace: async (spacePayload) => {
        return await fetchData('/admin/vendor-spaces', {
            method: 'POST',
            body: JSON.stringify(spacePayload)
        });
    },
    deleteVendorSpace: async (spaceId) => {
        return await fetchData(`/admin/vendor-spaces/${spaceId}`, {
            method: 'DELETE'
        });
    }
};
