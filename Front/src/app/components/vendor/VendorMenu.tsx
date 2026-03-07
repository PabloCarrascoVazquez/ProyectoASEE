import React from 'react';
import { useNavigate } from 'react-router';
import { Store, Search, History, User, TrendingUp, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

export const VendorMenu: React.FC = () => {
  const navigate = useNavigate();

  const stats = [
    { label: 'Espacios Alquilados', value: '3', change: '+2', icon: Store },
    { label: 'Ingresos Proyectados', value: '€15,000', change: '+25%', icon: TrendingUp },
    { label: 'Próximas Citas', value: '3', change: 'En agenda', icon: Calendar },
  ];

  const menuCards = [
    {
      title: 'Buscar Espacios',
      description: 'Explora stands por festival',
      icon: <Search className="w-8 h-8" />,
      color: 'from-[#FF2A5F] to-[#00F0FF]',
      action: () => navigate('/vendor/spaces'),
    },
    {
      title: 'Mis Reservas',
      description: 'Gestiona tus stands activos',
      icon: <Store className="w-8 h-8" />,
      color: 'from-[#00F0FF] to-[#FF2A5F]',
      action: () => navigate('/vendor/my-spaces'),
    },
    {
      title: 'Historial',
      description: 'Métricas de festivales pasados',
      icon: <History className="w-8 h-8" />,
      color: 'from-[#00F0FF] to-[#00D8E6]',
      action: () => navigate('/vendor/history'),
    },
    {
      title: 'Perfil Fiscal',
      description: 'Datos de facturación y perfil',
      icon: <User className="w-8 h-8" />,
      color: 'from-[#FF2A5F] to-[#E62555]',
      action: () => navigate('/vendor/profile'),
    },
  ];

  return (
    <div className="min-h-screen bg-[#0B0F19] p-8">
      <div className="max-w-7xl mx-auto py-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-12 border-l-4 border-[#00F0FF] pl-6"
        >
          <h1 className="text-5xl font-black text-[#F8FAFC] uppercase tracking-tighter mb-2">
            VENDOR <span className="text-[#00F0FF]">NEXUS</span>
          </h1>
          <p className="text-[#94A3B8] text-lg uppercase tracking-widest font-bold">Panel de Control de Proveedor</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-[#1A2235] border border-white/5 rounded-3xl p-8"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/5 rounded-2xl text-[#FF2A5F]">
                    <stat.icon className="w-8 h-8" />
                </div>
                <span className="text-xs font-black text-[#00F0FF] bg-[#00F0FF]/10 px-3 py-1 rounded-full">{stat.change}</span>
              </div>
              <h3 className="text-4xl font-black text-[#F8FAFC] mb-1">{stat.value}</h3>
              <p className="text-xs font-bold text-[#94A3B8] uppercase tracking-widest">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {menuCards.map((card, index) => (
            <motion.div
              key={card.title}
              whileHover={{ scale: 1.02, y: -5 }}
              onClick={card.action}
              className="relative group cursor-pointer bg-[#1A2235] border border-white/5 p-8 rounded-3xl hover:border-[#FF2A5F]/40 transition-all"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-6 text-white shadow-lg`}>
                {card.icon}
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2 group-hover:text-[#FF2A5F] transition-colors">
                {card.title}
              </h3>
              <p className="text-gray-400 text-sm font-medium leading-tight">{card.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="bg-[#1A2235] border border-white/5 rounded-3xl p-8">
          <h2 className="text-2xl font-black text-white uppercase italic mb-8">Log de Actividad</h2>
          <div className="space-y-4">
            {[
              { action: 'Reserva Confirmada', event: 'Subsonic Festival 2026', detail: 'Main Food Court Spot A', time: '2d' },
              { action: 'Solicitud Recibida', event: 'Afterparty 2026', detail: 'Premium Beverage Stand', time: '4d' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-5 rounded-2xl bg-[#0B0F19]/50 border border-white/5">
                <div>
                  <h4 className="text-[#F8FAFC] font-bold text-sm uppercase">{activity.action}</h4>
                  <p className="text-xs text-[#94A3B8] mt-1 font-medium">{activity.event} • <span className="text-[#00F0FF]">{activity.detail}</span></p>
                </div>
                <span className="text-[10px] font-black text-[#94A3B8] uppercase">{activity.time} ago</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
