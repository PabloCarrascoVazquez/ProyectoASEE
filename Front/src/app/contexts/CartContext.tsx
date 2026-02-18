import React, { createContext, useContext, useState, ReactNode } from 'react';

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
  checkout: () => void;
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

  const checkout = () => {
    const ticketItems = cart.filter((item) => item.type === 'ticket');
    const newTickets: PurchasedTicket[] = ticketItems.map((item) => ({
      id: `ticket-${Date.now()}-${Math.random()}`,
      eventId: item.eventId || '1',
      eventName: item.name,
      ticketType: item.name,
      price: item.price,
      purchaseDate: new Date().toISOString(),
      qrCode: `SUBSONIC-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      image: item.image,
    }));
    setPurchasedTickets((prev) => [...prev, ...newTickets]);
    clearCart();
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
