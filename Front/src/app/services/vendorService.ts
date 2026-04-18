import { VendorSpace } from '../data/mockData';
import { AdminAPI } from '../api/admin_api';
import { VendorAPI } from '../api/vendor_api';

/**
 * Mapea la respuesta cruda del backend (snake_case + boolean numérico)
 * a nuestra interfaz VendorSpace de TS.
 */
function adaptSpace(raw: any): VendorSpace {
  return {
    ...raw,
    id: String(raw.id),
    eventId: raw.event_id ?? raw.eventId,
    name: raw.name,
    // El backend actualmente sólo almacena available + services;
    // price/location/type los dejamos flexibles para no romper la UI.
    price: raw.price ?? 0,
    location: raw.location ?? 'Zona General',
    type: raw.type ?? (Array.isArray(raw.services) ? raw.services[0] : 'food'),
    available: Boolean(raw.available),
    services: Array.isArray(raw.services) ? raw.services : []
  } as VendorSpace;
}

export const vendorService = {
  /**
   * Lista todos los puestos (como admin, desde /api/admin/vendor-spaces).
   */
  getAll: async (): Promise<VendorSpace[]> => {
    try {
      const rows = await AdminAPI.listVendorSpaces();
      return rows.map(adaptSpace);
    } catch (error) {
      console.error('Error al listar vendor spaces:', error);
      return [];
    }
  },

  /**
   * Crea un nuevo espacio (admin). Requiere token admin.
   */
  create: async (newSpace: VendorSpace): Promise<VendorSpace> => {
    const payload = {
      id: newSpace.id,
      event_id: newSpace.eventId,
      name: newSpace.name,
      available: newSpace.available ?? true,
      // Empaquetamos la metadata extra como 'services' porque es lo que acepta el schema.
      services: newSpace.services && newSpace.services.length > 0
        ? newSpace.services
        : [newSpace.type].filter(Boolean)
    };
    const saved = await AdminAPI.createVendorSpace(payload);
    return adaptSpace({ ...payload, ...saved, ...newSpace });
  },

  /**
   * Borra un espacio (admin).
   */
  delete: async (id: string): Promise<boolean> => {
    await AdminAPI.deleteVendorSpace(id);
    return true;
  },

  // -------- MÉTODOS PARA USUARIOS CON ROL 'vendor' --------

  /**
   * Perfil del vendedor autenticado.
   */
  getMyProfile: async () => {
    return await VendorAPI.getProfile();
  },

  /**
   * Actualiza el perfil del vendedor autenticado.
   */
  updateMyProfile: async (data: { name?: string; email?: string; avatar?: string | null }) => {
    return await VendorAPI.updateProfile(data);
  },

  /**
   * Un vendedor reserva un puesto disponible.
   */
  reserveSpace: async (spaceId: string): Promise<VendorSpace> => {
    const raw = await VendorAPI.reserveSpace(spaceId);
    return adaptSpace(raw);
  },

  /**
   * Lista los puestos disponibles para un evento concreto.
   */
  listSpacesForEvent: async (eventId: string): Promise<VendorSpace[]> => {
    const rows = await VendorAPI.listSpacesByEvent(eventId);
    return rows.map(adaptSpace);
  }
};
