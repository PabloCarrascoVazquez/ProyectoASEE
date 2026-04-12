import { UserMerchAPI } from '../api/user_merch_api';

export const userMerchService = {
    getMyOrders: async () => {
        try {
            const data = await UserMerchAPI.getPurchases();
            
            if (!data || !Array.isArray(data)) return [];

            return data.map((order) => ({
                id: order.purchase_id,
                name: order.product_name,
                price: order.price_at_purchase,
                quantity: order.quantity,
                totalPrice: order.total_price,
                image: order.image,
                category: order.category,
                status: order.status,
                purchaseDate: order.purchase_date
            }));
        } catch (error) {
            console.error("Error en MerchService:", error);
            return [];
        }
    }
};