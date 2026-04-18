import { fetchData } from './api';

/**
 * Endpoints de 'vendor'. Requieren token con rol 'vendor' (o 'admin').
 */
export const VendorAPI = {
    getProfile: async () => {
        return await fetchData('/vendor/profile');
    },
    updateProfile: async (profilePayload) => {
        return await fetchData('/vendor/profile', {
            method: 'PUT',
            body: JSON.stringify(profilePayload)
        });
    },
    listAllSpaces: async () => {
        return await fetchData('/vendor/spaces');
    },
    listSpacesByEvent: async (eventId) => {
        return await fetchData(`/vendor/spaces/event/${eventId}`);
    },
    reserveSpace: async (spaceId) => {
        return await fetchData(`/vendor/spaces/${spaceId}/reserve`, {
            method: 'POST'
        });
    }
};
