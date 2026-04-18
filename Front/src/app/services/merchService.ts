import { MerchAPI } from '../api/merch_api';
import { AdminAPI } from '../api/admin_api';
import { MerchandiseItem } from '../models/interfaces';

export const merchService = {
  /**
   * Catálogo público - no necesita token.
   */
  getAll: async (): Promise<MerchandiseItem[]> => {
    try {
      const response = await MerchAPI.getAll();
      return response;
    } catch (error) {
      console.error("Error al obtener el merchandising:", error);
      return [];
    }
  },

  getById: async (id: string): Promise<MerchandiseItem | null> => {
    try {
      const response = await MerchAPI.getById(id);
      return response.data[0] || null;
    } catch (error) {
      console.error(`Error al obtener producto ${id}:`, error);
      return null;
    }
  },

  /**
   * Añade un producto al catálogo. Requiere token admin.
   */
  create: async (newItem: MerchandiseItem): Promise<MerchandiseItem> => {
    const payload = {
      name: newItem.name,
      price: newItem.price,
      category: newItem.category,
      image: newItem.image
    };
    const saved = await AdminAPI.createMerch(payload);
    return { ...newItem, ...saved };
  },

  /**
   * Borra un producto del catálogo. Requiere token admin.
   */
  delete: async (id: string): Promise<boolean> => {
    await AdminAPI.deleteMerch(id);
    return true;
  }
};
