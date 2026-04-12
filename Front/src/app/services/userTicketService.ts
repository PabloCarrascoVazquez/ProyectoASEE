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
}

export const userTicketService = {
    /**
     * Recupera y mapea las entradas del usuario para la UI
     */
    getUserWallet: async (): Promise<PurchasedTicket[]> => {
        try {
            const data = await UserTicketsAPI.getMyTickets();
            
            if (!data || !Array.isArray(data)) return [];

            // Adaptamos los nombres de los campos de Flask al Frontend
            return data.map((ticket: any) => ({
                id: ticket.ticket_instance_id || ticket.id,
                eventName: ticket.event_name,
                eventDate: ticket.event_date,
                ticketType: ticket.type,
                price: ticket.price,
                qrCode: ticket.qr_code,
                purchaseDate: ticket.purchase_date,
                image: ticket.image_url || ticket.image
            }));
        } catch (error) {
            console.error("Error en userTicketService:", error);
            return [];
        }
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