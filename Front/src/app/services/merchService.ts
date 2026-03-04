import { MerchandiseItem, mockMerchandise } from '../data/mockData';

const STORAGE_KEY = 'subsonic_merch';
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const getStoredMerch = (): MerchandiseItem[] => {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : mockMerchandise;
};

export const merchService = {
  // GET
  getAll: async (): Promise<MerchandiseItem[]> => {
    await delay(600);
    return getStoredMerch();
  },

  // POST
  create: async (newItem: MerchandiseItem): Promise<MerchandiseItem> => {
    await delay(800);
    const items = getStoredMerch();
    const updated = [newItem, ...items];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newItem;
  },

  // DELETE
  delete: async (id: string): Promise<boolean> => {
    await delay(500);
    const items = getStoredMerch();
    const filtered = items.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  }
};