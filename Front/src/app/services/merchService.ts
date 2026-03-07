import { MerchandiseItem, mockMerchandise } from '../data/mockData';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// --- BASE DE DATOS EN MEMORIA ---
// Se inicializa con los datos del mockData.ts cada vez que se carga la página.
let merchDB = [...mockMerchandise];

export const merchService = {
  // GET: Obtener todos los productos de merchandising
  getAll: async (): Promise<MerchandiseItem[]> => {
    await delay(600);
    // Retornamos la lista actual en memoria
    return merchDB;
  },

  // POST: Crear/Añadir un nuevo producto (solo durante la sesión actual)
  create: async (newItem: MerchandiseItem): Promise<MerchandiseItem> => {
    await delay(800);
    // Añadimos al inicio para que el admin vea el cambio arriba
    merchDB = [newItem, ...merchDB];
    return newItem;
  },

  // DELETE: Eliminar un producto (solo durante la sesión actual)
  delete: async (id: string): Promise<boolean> => {
    await delay(500);
    // Actualizamos la variable de memoria filtrando el ID
    merchDB = merchDB.filter(item => item.id !== id);
    return true;
  }
};