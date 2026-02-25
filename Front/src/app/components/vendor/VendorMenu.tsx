import React from 'react';
import { useNavigate } from 'react-router';
import { Store, Search, History, User, TrendingUp, Calendar } from 'lucide-react';
import { motion } from 'motion/react';

export const VendorMenu: React.FC = () => {
  const navigate = useNavigate();

  const stats = [
    { label: 'Espacios Alquilados', value: '3', change: '+2', icon: Store },
    { label: 'Ingresos Totales', value: '€15,000', change: '+25%', icon: TrendingUp },
    { label: 'Próximos Eventos', value: '5', change: '2 pendientes', icon: Calendar },
  ];

  const menuCards = [
    {
      title: 'Buscar Espacios',
      description: 'Encuentra el espacio para tu negocio',
      icon: <Search className="w-8 h-8" />,
      color: 'from-[#FF2A5F] to-[#00F0FF]',
      action: () => navigate('/vendor/spaces'),
    },
    {
      title: 'Mis Espacios',
      description: 'Gestiona tus espacios alquilados',
      icon: <Store className="w-8 h-8" />,
      color: 'from-[#00F0FF] to-[#FF2A5F]',
      action: () => navigate('/vendor/my-spaces'),
    },
    {
      title: 'Historial',
      description: 'Revisa tu historial de festivales',
      icon: <History className="w-8 h-8" />,
      color: 'from-[#00F0FF] to-[#00D8E6]',
      action: () => navigate('/vendor/history'),
    },
    {
      title: 'Perfil Público',
      description: 'Edita tu perfil de proveedor',
      icon: <User className="w-8 h-8" />,
      color: 'from-[#FF2A5F] to-[#E62555]',
      action: () => navigate('/vendor/profile'),
    },
  ];

  return (
    <div className="min-h-screen bg-[#0B0F19]">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl mb-2 bg-gradient-to-r from-[#FF2A5F] to-[#00F0FF] bg-clip-text text-transparent">
            Menú de Proveedor
          </h1>
          <p className="text-xl text-[#94A3B8]">Gestiona tus espacios en Subsonic Festival</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-[#1A2235] border border-[#FF2A5F]/30 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <stat.icon className="w-8 h-8 text-[#FF2A5F]" />
                <span className="text-sm text-[#00F0FF]">{stat.change}</span>
              </div>
              <h3 className="text-3xl mb-1 text-[#F8FAFC]">{stat.value}</h3>
              <p className="text-sm text-[#94A3B8]">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {menuCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              onClick={card.action}
              className="group cursor-pointer"
            >
              <div className="relative rounded-2xl overflow-hidden bg-[#1A2235] border border-[#FF2A5F]/30 hover:border-[#FF2A5F]/60 transition-all hover:scale-105 p-6">
                <div
                  className={`w-16 h-16 rounded-xl bg-gradient-to-r ${card.color} flex items-center justify-center mb-4 text-[#F8FAFC]`}
                >
                  {card.icon}
                </div>
                <h3 className="text-xl mb-2 text-[#F8FAFC] group-hover:text-[#FF2A5F] transition-colors">
                  {card.title}
                </h3>
                <p className="text-[#94A3B8] text-sm">{card.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <h2 className="text-2xl mb-6 text-[#F8FAFC]">Actividad Reciente</h2>
          <div className="bg-[#1A2235] border border-[#FF2A5F]/30 rounded-2xl p-6">
            <div className="space-y-4">
              {[
                { action: 'Solicitud aprobada', detail: 'Food Court Spot A - Festival 2026', time: 'Hace 2 días' },
                { action: 'Pago recibido', detail: '€5,000 - Depósito inicial', time: 'Hace 4 días' },
                { action: 'Nueva solicitud enviada', detail: 'Premium Beverage Stand B - Afterparty', time: 'Hace 1 semana' },
              ].map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-xl bg-[#0B0F19]/50 border border-[#00F0FF]/20"
                >
                  <div>
                    <h4 className="text-[#F8FAFC] mb-1">{activity.action}</h4>
                    <p className="text-sm text-[#94A3B8]">{activity.detail}</p>
                  </div>
                  <span className="text-xs text-[#94A3B8]/60">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
