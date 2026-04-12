import React from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { ShoppingCart, Ticket, Music, Store, Package, Calendar } from 'lucide-react';
import { motion } from 'motion/react';

export const Menu: React.FC = () => {
  const { user } = useAuth();
  const { purchasedTickets, getTotalItems } = useCart();
  const navigate = useNavigate();

  // --- CONFIGURACIÓN DE TARJETAS ---
  const menuCards = [
    {
      title: 'Mis Entradas',
      description: `Tienes ${purchasedTickets.length} ticket${purchasedTickets.length !== 1 ? 's' : ''} activos`,
      icon: <Ticket className="w-8 h-8" />,
      color: 'from-[#FF2A5F] to-[#00F0FF]',
      action: () => navigate('/tickets'),
    },
    {
      title: 'Carrito',
      description: `Tienes ${getTotalItems()} producto${getTotalItems() !== 1 ? 's' : ''} esperando`,
      icon: <ShoppingCart className="w-8 h-8" />,
      color: 'from-[#00F0FF] to-[#FF2A5F]',
      action: () => navigate('/cart'),
    },
    {
      title: 'Mi Merch',
      description: 'Historial de compras merch',
      icon: <Package className="w-8 h-8" />, 
      color: 'from-[#FF2A5F] to-[#E62555]',
      action: () => navigate('/profile/merch'),
    },
    
  ];

  return (
    <div className="min-h-screen bg-[#0B0F19]">
      <div className="max-w-7xl mx-auto px-4 py-12">
        
        {/* Header de Bienvenida */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center space-x-4 mb-2">
            <div className="w-14 h-14 rounded-full bg-gradient-to-r from-[#FF2A5F] to-[#00F0FF] flex items-center justify-center font-black text-2xl text-white shadow-[0_0_20px_rgba(255,42,95,0.3)]">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl bg-gradient-to-r from-[#FF2A5F] to-[#00F0FF] bg-clip-text text-transparent font-black uppercase tracking-tighter">
                ¡Hola, {user?.name || 'Raver'}!
              </h1>
              <p className="text-xl text-[#94A3B8] font-light">Bienvenido a tu centro de control Subsonic</p>
            </div>
          </div>
        </motion.div>

        {/* Grid de Tarjetas de Menú */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={card.action}
              className="group cursor-pointer"
            >
              <div className="relative rounded-3xl overflow-hidden bg-[#1A2235] border border-[#FF2A5F]/20 hover:border-[#FF2A5F]/60 transition-all duration-300 hover:scale-[1.03] p-8 h-full shadow-lg group-hover:shadow-[0_0_30px_rgba(255,42,95,0.15)]">
                
                {/* Icon Container */}
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-6 text-[#F8FAFC] shadow-[0_0_20px_rgba(0,0,0,0.3)] group-hover:scale-110 transition-transform duration-500`}>
                  {card.icon}
                </div>

                {/* Text Content */}
                <h3 className="text-2xl mb-2 text-[#F8FAFC] group-hover:text-[#FF2A5F] transition-colors font-black uppercase tracking-tight">
                  {card.title}
                </h3>
                <p className="text-[#94A3B8] text-sm font-medium">
                  {card.description}
                </p>

                {/* Decorative Element */}
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-1 h-8 bg-gradient-to-b from-[#FF2A5F] to-transparent rounded-full"></div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer simple (opcional) */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-20 pt-8 border-t border-white/5 text-center"
        >
          <p className="text-[#94A3B8] text-xs font-bold uppercase tracking-[0.2em]">
            Subsonic Ecosystem © 2026 | Protocolo de Acceso Seguro
          </p>
        </motion.div>

      </div>
    </div>
  );
};