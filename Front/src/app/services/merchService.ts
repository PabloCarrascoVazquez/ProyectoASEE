import { MerchAPI } from '../api/merch_api';
import { MerchandiseItem } from '../models/interfaces';

export const merchService = {
  /**
   * Obtiene todo el catálogo de merchandising desde el servidor.
   * El Backend ya devuelve una lista mapeada a MerchandiseItem[].
   */
  getAll: async (): Promise<MerchandiseItem[]> => {
    try {
      // Llamada a GET /api/merchandise
      const response = await MerchAPI.getAll();
      
      // Como el Backend devuelve directamente el array formateado:
      return response; 
    } catch (error) {
      console.error("Error al obtener el merchandising:", error);
      return []; // Fallback a lista vacía para no romper la UI
    }
  },

  /**
   * Obtiene un producto específico por su ID.
   */
  getById: async (id: string): Promise<MerchandiseItem | null> => {
    try {
      const response = await MerchAPI.getById(id);
      // El Backend devuelve { "status": "success", "data": [producto] }
      return response.data[0] || null;
    } catch (error) {
      console.error(`Error al obtener producto ${id}:`, error);
      return null;
    }
  },

  /**
   * POST: Preparado para cuando implementemos la persistencia real.
   */
  create: async (newItem: MerchandiseItem): Promise<MerchandiseItem> => {
    console.warn("Backend: Registro de producto no implementado (POST).");
    // Por ahora simulamos el retorno del objeto enviado
    return newItem;
  },

  /**
   * DELETE: Preparado para cuando implementemos el borrado real.
   */
  delete: async (id: string): Promise<boolean> => {
    console.warn("Backend: Borrado de producto no implementado (DELETE).");
    return true;
  }
};