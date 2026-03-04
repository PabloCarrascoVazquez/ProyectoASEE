import { VendorSpace, mockVendorSpaces } from '../data/mockData';

const STORAGE_KEY = 'admin_spaces';
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const getStoredSpaces = (): VendorSpace[] => {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : mockVendorSpaces;
};

export const vendorService = {
  // GET: Obtener todos los espacios
  getAll: async (): Promise<VendorSpace[]> => {
    await delay(700);
    return getStoredSpaces();
  },

  // POST: Crear un nuevo espacio
  create: async (newSpace: VendorSpace): Promise<VendorSpace> => {
    await delay(800);
    const spaces = getStoredSpaces();
    const updated = [newSpace, ...spaces];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newSpace;
  },

  // DELETE: Eliminar un espacio
  delete: async (id: string): Promise<boolean> => {
    await delay(500);
    const spaces = getStoredSpaces();
    const filtered = spaces.filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  }
};