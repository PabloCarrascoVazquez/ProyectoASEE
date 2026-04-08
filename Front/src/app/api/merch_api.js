import { fetchData } from './api';

export const MerchAPI = { 
    getAll: async () => {
        return await fetchData('/merchandise');
    },
    getById: async (id) => {
        return await fetchData(`/merchandise/${id}`);
    }
};