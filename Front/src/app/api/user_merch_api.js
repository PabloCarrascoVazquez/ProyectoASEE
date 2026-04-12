import { fetchData } from './api';

export const UserMerchAPI = { 
    // Obtener historial
    getPurchases: async () => {
        return await fetchData('/user/merch');
    },

    // Comprar (POST)
    buyItem: async (merchId, quantity) => {
        return await fetchData('/purchase/merch', {
            method: 'POST',
            body: JSON.stringify({
                merch_id: merchId,
                quantity: quantity
            })
        });
    }
};