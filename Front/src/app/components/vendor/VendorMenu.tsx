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
      color: 'from-pink-500 to-purple-500',
      action: () => navigate('/vendor/spaces'),
    },
    {
      title: 'Mis Espacios',
      description: 'Gestiona tus espacios alquilados',
      icon: <Store className="w-8 h-8" />,
      color: 'from-purple-500 to-blue-500',
      action: () => navigate('/vendor/my-spaces'),
    },
    {
      title: 'Historial',
      description: 'Revisa tu historial de festivales',
      icon: <History className="w-8 h-8" />,
      color: 'from-blue-500 to-cyan-500',
      action: () => navigate('/vendor/history'),
    },
    {
      title: 'Perfil Público',
      description: 'Edita tu perfil de proveedor',
      icon: <User className="w-8 h-8" />,
      color: 'from-cyan-500 to-green-500',
      action: () => navigate('/vendor/profile'),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-950 to-black">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl mb-2 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
            Menú de Proveedor
          </h1>
          <p className="text-xl text-gray-400">Gestiona tus espacios en Subsonic Festival</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-pink-500/30 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <stat.icon className="w-8 h-8 text-pink-400" />
                <span className="text-sm text-green-400">{stat.change}</span>
              </div>
              <h3 className="text-3xl mb-1 text-white">{stat.value}</h3>
              <p className="text-sm text-gray-400">{stat.label}</p>
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
              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-pink-500/30 hover:border-pink-500/60 transition-all hover:scale-105 p-6">
                <div
                  className={`w-16 h-16 rounded-xl bg-gradient-to-r ${card.color} flex items-center justify-center mb-4 text-white`}
                >
                  {card.icon}
                </div>
                <h3 className="text-xl mb-2 text-white group-hover:text-pink-400 transition-colors">
                  {card.title}
                </h3>
                <p className="text-gray-400 text-sm">{card.description}</p>
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
          <h2 className="text-2xl mb-6 text-white">Actividad Reciente</h2>
          <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-pink-500/30 rounded-2xl p-6">
            <div className="space-y-4">
              {[
                { action: 'Solicitud aprobada', detail: 'Food Court Spot A - Festival 2026', time: 'Hace 2 días' },
                { action: 'Pago recibido', detail: '€5,000 - Depósito inicial', time: 'Hace 4 días' },
                { action: 'Nueva solicitud enviada', detail: 'Premium Beverage Stand B - Afterparty', time: 'Hace 1 semana' },
              ].map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-xl bg-purple-900/20 border border-purple-500/20"
                >
                  <div>
                    <h4 className="text-white mb-1">{activity.action}</h4>
                    <p className="text-sm text-gray-400">{activity.detail}</p>
                  </div>
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
