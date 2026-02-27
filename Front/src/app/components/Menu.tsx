import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { ShoppingCart, Ticket, Music, Store, Users, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import { mockEvents, Event } from '../data/mockData'; // Importamos el tipo Event también

export const Menu: React.FC = () => {
  const { user } = useAuth();
  const { purchasedTickets, getTotalItems } = useCart();
  const navigate = useNavigate();

  // 1. Cargar eventos sincronizados (igual que en Home)
  const [events, setEvents] = useState<Event[]>(() => {
    const saved = localStorage.getItem('subsonic_events');
    return saved ? JSON.parse(saved) : mockEvents;
  });

  // 2. Sincronizar si hay cambios en otras pestañas
  useEffect(() => {
    const syncEvents = () => {
      const saved = localStorage.getItem('subsonic_events');
      if (saved) setEvents(JSON.parse(saved));
    };
    window.addEventListener('storage', syncEvents);
    return () => window.removeEventListener('storage', syncEvents);
  }, []);

  const menuCards = [
    {
      title: 'Mis Entradas',
      description: `Tienes ${purchasedTickets.length} entrada${purchasedTickets.length !== 1 ? 's' : ''}`,
      icon: <Ticket className="w-8 h-8" />,
      color: 'from-[#FF2A5F] to-[#00F0FF]',
      action: () => navigate('/tickets'),
    },
    {
      title: 'Carrito',
      description: `${getTotalItems()} producto${getTotalItems() !== 1 ? 's' : ''}`,
      icon: <ShoppingCart className="w-8 h-8" />,
      color: 'from-[#00F0FF] to-[#FF2A5F]',
      action: () => navigate('/cart'),
    },
    {
      title: 'Música',
      description: 'Escucha a los artistas',
      icon: <Music className="w-8 h-8" />,
      color: 'from-[#00F0FF] to-[#00F0FF]/80',
      action: () => navigate('/music'),
    },
    {
      title: 'Merchandising',
      description: 'Productos oficiales',
      icon: <Store className="w-8 h-8" />,
      color: 'from-[#00F0FF] to-[#00D8E6]',
      action: () => navigate('/merchandise'),
    },
    {
      title: 'Radar de Amigos',
      description: 'Encuentra a tus amigos',
      icon: <Users className="w-8 h-8" />,
      color: 'from-[#FF2A5F] to-[#E62555]',
      action: () => navigate('/friends-radar'),
    },
    {
      title: 'Eventos',
      description: 'Ver todos los eventos',
      icon: <Calendar className="w-8 h-8" />,
      color: 'from-[#FF2A5F] to-[#FF2A5F]/80',
      action: () => navigate('/'),
    },
  ];

  return (
    <div className="min-h-screen bg-[#0B0F19]">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl mb-2 bg-gradient-to-r from-[#FF2A5F] to-[#00F0FF] bg-clip-text text-transparent font-bold">
            ¡Hola, {user?.name}!
          </h1>
          <p className="text-xl text-[#94A3B8]">Bienvenido a tu menú de Subsonic Festival</p>
        </motion.div>

        {/* Menu Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {menuCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={card.action}
              className="group cursor-pointer"
            >
              <div className="relative rounded-2xl overflow-hidden bg-[#1A2235] border border-[#FF2A5F]/30 hover:border-[#FF2A5F]/60 transition-all hover:scale-105 p-6 h-full">
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${card.color} flex items-center justify-center mb-4 text-[#F8FAFC] shadow-lg`}>
                  {card.icon}
                </div>
                <h3 className="text-xl mb-2 text-[#F8FAFC] group-hover:text-[#FF2A5F] transition-colors font-bold">
                  {card.title}
                </h3>
                <p className="text-[#94A3B8] text-sm">{card.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Upcoming Events - USANDO EL ESTADO DINÁMICO */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12"
        >
          <h2 className="text-2xl mb-6 text-[#F8FAFC] font-bold">Próximos Eventos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Cambiamos mockEvents.slice por events.slice */}
            {events.slice(0, 3).map((event) => (
              <div
                key={event.id}
                onClick={() => navigate(`/event/${event.id}`)}
                className="group cursor-pointer rounded-2xl overflow-hidden bg-[#1A2235] border border-[#FF2A5F]/30 hover:border-[#FF2A5F]/60 transition-all hover:shadow-[0_0_20px_rgba(255,42,95,0.15)]"
              >
                <div className="h-48 overflow-hidden relative">
                  <img
                    src={event.image}
                    alt={event.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A2235] to-transparent opacity-60" />
                </div>
                <div className="p-5">
                  <h3 className="text-[#F8FAFC] mb-2 font-bold group-hover:text-[#FF2A5F] transition-colors">{event.name}</h3>
                  <div className="flex items-center text-sm text-[#94A3B8] mb-3">
                    <Calendar className="w-4 h-4 mr-2 text-[#00F0FF]" />
                    {new Date(event.date).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                    })}
                  </div>
                  <p className="text-sm font-bold text-[#FF2A5F]">
                    {event.ticketPrices && event.ticketPrices.length > 0 
                      ? `Desde €${Math.min(...event.ticketPrices.map((t) => t.price))}`
                      : 'Próximamente'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};