import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserTicketsAPI } from '../api/user_tickets_api';
import { UserMerchAPI } from '../api/user_merch_api';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  type: 'ticket' | 'merchandise';
  image?: string;
  eventId?: string;
}

export interface PurchasedTicket {
  id: string;
  eventId: string;
  eventName: string;
  ticketType: string;
  price: number;
  purchaseDate: string;
  qrCode: string;
  image?: string;
}

interface CartContextType {
  cart: CartItem[];
  purchasedTickets: PurchasedTicket[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  checkout: () => Promise<boolean>;
  cancelTicket: (ticketId: string) => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [purchasedTickets, setPurchasedTickets] = useState<PurchasedTicket[]>([]);

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const existingItem = prev.find((i) => i.id === item.id);
      if (existingItem) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      }
      return [...prev, item];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const checkout = async () => {
    try {
      // 1. Separamos tickets y merchandising
      const ticketItems = cart.filter((item) => item.type === 'ticket');
      const merchItems = cart.filter((item) => item.type === 'merchandise');

      // 2. Enviamos las compras de TICKETS al servidor
      for (const item of ticketItems) {
        // Repetimos la llamada según la cantidad comprada
        for (let i = 0; i < item.quantity; i++) {
          await UserTicketsAPI.buyTicket(item.id); // item.id aquí es el ticket_price_id
        }
      }

      // 3. Enviamos las compras de MERCH al servidor
      for (const item of merchItems) {
        await UserMerchAPI.buyItem(item.id, item.quantity);
      }

      // 4. Limpiamos el carrito local
      clearCart();
      
      return true; // Indicamos que salió bien
    } catch (error) {
      console.error("Error en el proceso de compra:", error);
      throw error;
    }
  };

  const cancelTicket = (ticketId: string) => {
    setPurchasedTickets((prev) => prev.filter((ticket) => ticket.id !== ticketId));
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        purchasedTickets,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        checkout,
        cancelTicket,
        getTotalItems,
        getTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
