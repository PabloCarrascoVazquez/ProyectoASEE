import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { eventService } from '../services/eventService'; // 1. Importamos el servicio
import { ShoppingCart, Ticket, Music, Store, Users, Calendar, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Event } from '../data/mockData';
import { toast } from 'sonner';

export const Menu: React.FC = () => {
  const { user } = useAuth();
  const { purchasedTickets, getTotalItems } = useCart();
  const navigate = useNavigate();

  // --- ESTADOS ---
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  // --- CARGA DE DATOS ---
  const loadMenuData = async () => {
    try {
      const data = await eventService.getAll();
      setEvents(data);
    } catch (error) {
      toast.error('Error al actualizar el panel de usuario');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenuData();

    // Sincronización entre pestañas (Storage Event)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'subsonic_events') loadMenuData();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // --- CONFIGURACIÓN DE TARJETAS ---
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
      action: () => navigate('/radar'), // Ajustado a la ruta que definimos
    },
    {
      title: 'Eventos',
      description: 'Ver todos los eventos',
      icon: <Calendar className="w-8 h-8" />,
      color: 'from-[#FF2A5F] to-[#FF2A5F]/80',
      action: () => navigate('/'),
    },
  ];

  // --- RENDER DE CARGA ---
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#00F0FF] animate-spin mb-4" />
        <p className="text-[#94A3B8] font-medium animate-pulse">Cargando tu perfil Subsonic...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F19]">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center space-x-4 mb-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#FF2A5F] to-[#00F0FF] flex items-center justify-center font-black text-xl">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <h1 className="text-4xl md:text-5xl bg-gradient-to-r from-[#FF2A5F] to-[#00F0FF] bg-clip-text text-transparent font-black uppercase tracking-tighter">
              ¡Hola, {user?.name || 'Raver'}!
            </h1>
          </div>
          <p className="text-xl text-[#94A3B8] font-light">Bienvenido a tu centro de control Subsonic</p>
        </motion.div>

        {/* Menu Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {menuCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={card.action}
              className="group cursor-pointer"
            >
              <div className="relative rounded-3xl overflow-hidden bg-[#1A2235] border border-[#FF2A5F]/20 hover:border-[#FF2A5F]/60 transition-all duration-300 hover:scale-[1.03] p-8 h-full shadow-lg">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-6 text-[#F8FAFC] shadow-[0_0_20px_rgba(0,0,0,0.3)] group-hover:scale-110 transition-transform`}>
                  {card.icon}
                </div>
                <h3 className="text-2xl mb-2 text-[#F8FAFC] group-hover:text-[#FF2A5F] transition-colors font-black uppercase tracking-tight">
                  {card.title}
                </h3>
                <p className="text-[#94A3B8] text-sm font-medium">{card.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Próximos Eventos Sincronizados */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl text-[#F8FAFC] font-black uppercase tracking-tighter flex items-center">
              <span className="w-8 h-1 bg-[#FF2A5F] mr-4 rounded-full"></span>
              Próximas Citas
            </h2>
            <button onClick={() => navigate('/')} className="text-[#00F0FF] text-sm font-bold uppercase hover:underline">
              Ver calendario completo
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.slice(0, 3).map((event) => (
              <div
                key={event.id}
                onClick={() => navigate(`/event/${event.id}`)}
                className="group cursor-pointer rounded-3xl overflow-hidden bg-[#1A2235] border border-white/5 hover:border-[#FF2A5F]/40 transition-all duration-500"
              >
                <div className="h-44 overflow-hidden relative">
                  <img
                    src={event.image}
                    alt={event.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A2235] to-transparent" />
                </div>
                <div className="p-6">
                  <h3 className="text-[#F8FAFC] mb-2 font-bold group-hover:text-[#FF2A5F] transition-colors line-clamp-1 italic uppercase tracking-tight">
                    {event.name}
                  </h3>
                  <div className="flex items-center text-xs text-[#94A3B8] font-bold uppercase tracking-widest">
                    <Calendar className="w-3 h-3 mr-2 text-[#00F0FF]" />
                    {new Date(event.date).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};