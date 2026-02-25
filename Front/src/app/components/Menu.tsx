import React from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { ShoppingCart, Ticket, Music, Store, Users, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import { mockEvents } from '../data/mockData';

export const Menu: React.FC = () => {
  const { user } = useAuth();
  const { purchasedTickets, getTotalItems } = useCart();
  const navigate = useNavigate();

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
          <h1 className="text-4xl md:text-5xl mb-2 bg-gradient-to-r from-[#FF2A5F] to-[#00F0FF] bg-clip-text text-transparent">
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
              <div className="relative rounded-2xl overflow-hidden bg-[#1A2235] border border-[#FF2A5F]/30 hover:border-[#FF2A5F]/60 transition-all hover:scale-105 p-6">
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${card.color} flex items-center justify-center mb-4 text-[#F8FAFC]`}>
                  {card.icon}
                </div>
                <h3 className="text-xl mb-2 text-[#F8FAFC] group-hover:text-[#FF2A5F] transition-colors">
                  {card.title}
                </h3>
                <p className="text-[#94A3B8]">{card.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Recent Tickets */}
        {purchasedTickets.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <h2 className="text-2xl mb-6 text-[#F8FAFC]">Mis Últimas Entradas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {purchasedTickets.slice(0, 3).map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => navigate('/tickets')}
                  className="cursor-pointer rounded-xl overflow-hidden bg-[#1A2235] border border-[#FF2A5F]/30 hover:border-[#FF2A5F]/60 transition-all"
                >
                  {ticket.image && (
                    <div className="h-32 overflow-hidden">
                      <img
                        src={ticket.image}
                        alt={ticket.eventName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="text-[#F8FAFC] mb-1">{ticket.eventName}</h3>
                    <p className="text-sm text-[#94A3B8]">{ticket.ticketType}</p>
                    <p className="text-sm text-[#FF2A5F] mt-2">€{ticket.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Upcoming Events */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12"
        >
          <h2 className="text-2xl mb-6 text-[#F8FAFC]">Próximos Eventos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockEvents.slice(0, 3).map((event) => (
              <div
                key={event.id}
                onClick={() => navigate(`/event/${event.id}`)}
                className="cursor-pointer rounded-xl overflow-hidden bg-[#1A2235] border border-[#FF2A5F]/30 hover:border-[#FF2A5F]/60 transition-all hover:scale-105"
              >
                <div className="h-48 overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-[#F8FAFC] mb-2">{event.name}</h3>
                  <p className="text-sm text-[#94A3B8]">
                    {new Date(event.date).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                    })}
                  </p>
                  <p className="text-sm text-[#FF2A5F] mt-2">
                    Desde €{Math.min(...event.ticketPrices.map((t) => t.price))}
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
