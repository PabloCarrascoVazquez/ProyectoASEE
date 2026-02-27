import React, { useState, useEffect } from 'react';
import { AdminEvents } from './AdminEvents';
import { AdminMerch } from './AdminMerch';
import { LayoutDashboard, Calendar, ShoppingBag } from 'lucide-react';

// --- MenuCard Component ---
const MenuCard = ({ icon, title, desc, onClick }: any) => (
  <button 
    onClick={onClick}
    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-300 transition-all text-left group"
  >
    <div className="mb-4 p-3 bg-gray-50 rounded-xl w-fit group-hover:bg-indigo-50 transition-colors">{icon}</div>
    <h3 className="text-xl font-bold text-gray-800">{title}</h3>
    <p className="text-gray-500 text-sm mt-2">{desc}</p>
  </button>
);

export const AdminPanel = () => {
  const [view, setView] = useState<'menu' | 'events' | 'merch'>('menu');

  // Usamos window.location en lugar de useLocation para evitar errores de librería
  useEffect(() => {
    const handlePopState = () => {
      if (window.location.pathname === '/admin') {
        setView('menu');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (view === 'events') return <AdminEvents onBack={() => setView('menu')} />;
  if (view === 'merch') return <AdminMerch onBack={() => setView('menu')} />;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Panel de Administración</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MenuCard 
          icon={<Calendar className="w-8 h-8 text-indigo-600" />}
          title="Eventos y Espacios"
          desc="Gestiona festivales, artistas y stands de venta."
          onClick={() => setView('events')}
        />
        <MenuCard 
          icon={<ShoppingBag className="w-8 h-8 text-pink-600" />}
          title="Merchandising"
          desc="Control de inventario, precios y categorías."
          onClick={() => setView('merch')}
        />
        <MenuCard 
          icon={<LayoutDashboard className="w-8 h-8 text-emerald-600" />}
          title="Estadísticas"
          desc="Ver ventas y usuarios (Próximamente)."
          onClick={() => {}} 
        />
      </div>
    </div>
  );
};