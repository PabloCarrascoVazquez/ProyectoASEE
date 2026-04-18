import { AdminAPI } from '../api/admin_api';

/**
 * Fachada que agrupa todas las acciones que sólo puede ejecutar un admin.
 * Usa internamente los servicios especializados; pensado para componentes
 * admin que prefieran una sola importación.
 */
export const adminService = {
  events: {
    create: (payload: any) => AdminAPI.createEvent(payload),
    delete: (id: string) => AdminAPI.deleteEvent(id)
  },
  merch: {
    create: (payload: any) => AdminAPI.createMerch(payload),
    delete: (id: string) => AdminAPI.deleteMerch(id)
  },
  vendorSpaces: {
    list: () => AdminAPI.listVendorSpaces(),
    create: (payload: any) => AdminAPI.createVendorSpace(payload),
    delete: (id: string) => AdminAPI.deleteVendorSpace(id)
  }
};
