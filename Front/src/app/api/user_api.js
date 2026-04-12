import { fetchData } from './api';

export const UserAPI = {
    // Endpoint de Registro
    register: async (name, email, password) => {
        return await fetchData('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password })
        });
    },

    // Endpoint de Login
    login: async (email, password) => {
        return await fetchData('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    },

    // Endpoint de Merch (requiere token, manejado por fetchData)
    getMerchOrders: async () => {
        return await fetchData('/user/merch');
    }
};