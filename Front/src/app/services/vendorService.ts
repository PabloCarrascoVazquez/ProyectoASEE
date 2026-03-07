import { VendorSpace, mockVendorSpaces } from '../data/mockData';

// --- CONFIGURACIÓN ---
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// Creamos una copia en memoria que hereda directamente de mockData.ts
// Así la "fuente de la verdad" es siempre el código.
let vendorsDB = [...mockVendorSpaces];

export const vendorService = {
  // GET: Obtener todos los espacios (Prioridad total al Mock)
  getAll: async (): Promise<VendorSpace[]> => {
    await delay(700);
    // Retornamos la base de datos en memoria
    return vendorsDB;
  },

  // POST: Crear un nuevo espacio
  create: async (newSpace: VendorSpace): Promise<VendorSpace> => {
    await delay(800);
    // Añadimos al inicio de nuestra lista en memoria
    vendorsDB = [newSpace, ...vendorsDB];
    return newSpace;
  },

  // DELETE: Eliminar un espacio
  delete: async (id: string): Promise<boolean> => {
    await delay(500);
    // Filtramos la lista en memoria
    vendorsDB = vendorsDB.filter(s => s.id !== id);
    return true;
  }
};