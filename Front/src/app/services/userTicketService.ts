import { UserTicketsAPI } from '../api/user_tickets_api';

export interface PurchasedTicket {
  id: string;
  eventName: string;
  eventDate: string;
  ticketType: string;
  price: number;
  qrCode: string;
  purchaseDate: string;
  image?: string;
  status: string; // Añadido para que coincida con lo que envías
}

export const userTicketService = {
    /**
     * Recupera y mapea las entradas del usuario para la UI
     */
    getUserWallet: async (): Promise<PurchasedTicket[]> => {
        const data = await UserTicketsAPI.getMyTickets();
        
        // Mapeamos los nombres de la DB a los nombres de tu interfaz
        // Usamos (t: any) para evitar problemas de tipos con los datos crudos del backend
        return data.map((t: any) => ({
            id: t.ticket_instance_id,      // 'ticket_instance_id' -> 'id'
            eventName: t.event_name,       // 'event_name' -> 'eventName'
            eventDate: t.event_date,       // 'event_date' -> 'eventDate'
            ticketType: t.type,            // 'type' -> 'ticketType'
            price: t.price,
            qrCode: t.qr_code || t.ticket_instance_id, // Fallback por si qr_code es null
            image: t.image_url,            // 'image_url' -> 'image'
            purchaseDate: t.purchase_date,
            status: t.status
        }));
    },

    /**
     * Lógica para procesar la cancelación de una entrada
     */
    cancel: async (ticketId: string) => {
        try {
            return await UserTicketsAPI.cancelTicket(ticketId);
        } catch (error) {
            console.error("Error al cancelar ticket:", error);
            throw error;
        }
    }
};