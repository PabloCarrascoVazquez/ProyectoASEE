import React, { useState, useEffect } from 'react';
import { AdminEvents } from './AdminEvents';
import { AdminMerch } from './AdminMerch';
import { AdminVendors } from './AdminVendors';
import { LayoutDashboard, Calendar, ShoppingBag, Store } from 'lucide-react';
import { useLocation } from 'react-router';
import { useNavigate } from 'react-router';

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
  const [view, setView] = useState<'menu' | 'events' | 'merch' | 'vendors'>('menu');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const currentView = params.get('view');

    if (location.pathname === '/admin' && !currentView) {
      setView('menu');
    } else if (currentView === 'events') {
      setView('events');
    } else if (currentView === 'merch') {
      setView('merch');
    } else if (currentView === 'vendors') {
      setView('vendors');
    }
  }, [location]);

  // Función para renderizar el contenido central
  const renderContent = () => {
    switch (view) {
      case 'events': return <AdminEvents />;
      case 'merch': return <AdminMerch />;
      case 'vendors': return <AdminVendors />;
      default: return (
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Panel de Administración</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MenuCard 
              icon={<Calendar className="w-8 h-8 text-indigo-600" />}
              title="Eventos"
              desc="Festivales y conciertos"
              onClick={() => navigate('/admin?view=events')}
            />
            <MenuCard 
              icon={<ShoppingBag className="w-8 h-8 text-pink-600" />}
              title="Merchandising"
              desc="Inventario de productos"
              onClick={() => navigate('/admin?view=merch')}
            />
            <MenuCard 
              icon={<Store className="w-8 h-8 text-emerald-600" />}
              title="Vendedores"
              desc="Espacios y stands"
              onClick={() => navigate('/admin?view=vendors')} 
            />
          </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {renderContent()}
    </div>
  );
};