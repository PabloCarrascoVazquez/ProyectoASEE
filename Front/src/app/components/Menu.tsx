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
      color: 'from-pink-500 to-purple-500',
      action: () => navigate('/tickets'),
    },
    {
      title: 'Carrito',
      description: `${getTotalItems()} producto${getTotalItems() !== 1 ? 's' : ''}`,
      icon: <ShoppingCart className="w-8 h-8" />,
      color: 'from-purple-500 to-blue-500',
      action: () => navigate('/cart'),
    },
    {
      title: 'Música',
      description: 'Escucha a los artistas',
      icon: <Music className="w-8 h-8" />,
      color: 'from-blue-500 to-cyan-500',
      action: () => navigate('/music'),
    },
    {
      title: 'Merchandising',
      description: 'Productos oficiales',
      icon: <Store className="w-8 h-8" />,
      color: 'from-cyan-500 to-green-500',
      action: () => navigate('/merchandise'),
    },
    {
      title: 'Radar de Amigos',
      description: 'Encuentra a tus amigos',
      icon: <Users className="w-8 h-8" />,
      color: 'from-green-500 to-yellow-500',
      action: () => navigate('/friends-radar'),
    },
    {
      title: 'Eventos',
      description: 'Ver todos los eventos',
      icon: <Calendar className="w-8 h-8" />,
      color: 'from-yellow-500 to-pink-500',
      action: () => navigate('/'),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-950 to-black">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl mb-2 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
            ¡Hola, {user?.name}!
          </h1>
          <p className="text-xl text-gray-400">Bienvenido a tu menú de Subsonic Festival</p>
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
              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-pink-500/30 hover:border-pink-500/60 transition-all hover:scale-105 p-6">
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${card.color} flex items-center justify-center mb-4 text-white`}>
                  {card.icon}
                </div>
                <h3 className="text-xl mb-2 text-white group-hover:text-pink-400 transition-colors">
                  {card.title}
                </h3>
                <p className="text-gray-400">{card.description}</p>
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
            <h2 className="text-2xl mb-6 text-white">Mis Últimas Entradas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {purchasedTickets.slice(0, 3).map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => navigate('/tickets')}
                  className="cursor-pointer rounded-xl overflow-hidden bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-pink-500/30 hover:border-pink-500/60 transition-all"
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
                    <h3 className="text-white mb-1">{ticket.eventName}</h3>
                    <p className="text-sm text-gray-400">{ticket.ticketType}</p>
                    <p className="text-sm text-pink-400 mt-2">€{ticket.price}</p>
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
          <h2 className="text-2xl mb-6 text-white">Próximos Eventos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockEvents.slice(0, 3).map((event) => (
              <div
                key={event.id}
                onClick={() => navigate(`/event/${event.id}`)}
                className="cursor-pointer rounded-xl overflow-hidden bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-pink-500/30 hover:border-pink-500/60 transition-all hover:scale-105"
              >
                <div className="h-48 overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-white mb-2">{event.name}</h3>
                  <p className="text-sm text-gray-400">
                    {new Date(event.date).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                    })}
                  </p>
                  <p className="text-sm text-pink-400 mt-2">
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
