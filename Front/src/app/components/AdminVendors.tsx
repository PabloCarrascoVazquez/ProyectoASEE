import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { VendorSpace, mockVendorSpaces, mockEvents, Event } from '../data/mockData';
import { vendorService } from '../services/vendorService';
import { eventService } from '../services/eventService';
import { Loader2, Trash2, Plus, Store, X, ArrowLeft, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export const AdminVendors: React.FC = () => {
  const navigate = useNavigate();
  
  // --- ESTADOS DE DATOS ---
  const [spaces, setSpaces] = useState<VendorSpace[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // --- ESTADOS DEL FORMULARIO ---
  const [isAdding, setIsAdding] = useState(false);
  const [newSpaceData, setNewSpaceData] = useState({ 
    name: '', 
    price: 0, 
    location: '', 
    type: 'food',
    eventId: '' // Campo obligatorio
  });

  // --- CARGA INICIAL ---
  useEffect(() => {
    const loadData = async () => {
      try {
        const [spacesData, eventsData] = await Promise.all([
          vendorService.getAll(),
          eventService.getAll()
        ]);
        setSpaces(spacesData);
        setEvents(eventsData);
        
        // Pre-seleccionar el primer evento si existe
        if (eventsData.length > 0) {
          setNewSpaceData(prev => ({ ...prev, eventId: eventsData[0].id }));
        }
      } catch (error) {
        toast.error('Error al cargar los datos del panel');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // --- MANEJADORES ---
  const handleAddSpace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpaceData.name || newSpaceData.price <= 0 || !newSpaceData.eventId) {
        toast.error("Completa todos los campos, incluyendo el evento asociado");
        return;
    }

    setIsSaving(true);

    const space: VendorSpace = {
      ...mockVendorSpaces[0], // Propiedades estructurales por defecto
      id: `s-${Date.now()}`,
      eventId: newSpaceData.eventId,
      name: newSpaceData.name,
      price: newSpaceData.price,
      location: newSpaceData.location || 'Zona General',
      type: newSpaceData.type,
      available: true
    };

    try {
      const savedSpace = await vendorService.create(space);
      setSpaces([savedSpace, ...spaces]);
      toast.success('Stand asociado al evento con éxito');
      setIsAdding(false);
      // Resetear manteniendo el eventId actual para facilitar cargas múltiples
      setNewSpaceData({ ...newSpaceData, name: '', price: 0, location: '' });
    } catch (error) {
      toast.error('Error al guardar el espacio');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`¿Eliminar el espacio "${name}"?`)) {
      try {
        const success = await vendorService.delete(id);
        if (success) {
          setSpaces(spaces.filter(s => s.id !== id));
          toast.success('Espacio eliminado');
        }
      } catch (error) {
        toast.error('No se pudo eliminar');
      }
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-3xl shadow-xl flex flex-col items-center border border-gray-100">
          <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mb-4" />
          <p className="text-gray-500 font-bold tracking-tight">Sincronizando Nexus Vendors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-gray-900">
      <button 
        onClick={() => navigate('/admin')} 
        className="flex items-center text-gray-500 hover:text-emerald-600 mb-6 transition-colors font-medium group"
      >
        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> 
        Volver al panel
      </button>

      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-emerald-100 rounded-2xl">
            <Store className="w-8 h-8 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-3xl font-bold italic uppercase tracking-tighter">Gestión de Espacios</h2>
            <p className="text-gray-500 text-sm">Asigna stands comerciales a los eventos activos.</p>
          </div>
        </div>
        
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="bg-emerald-600 text-white px-6 py-3 rounded-full flex items-center shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all font-bold"
          >
            <Plus className="w-5 h-5 mr-2" /> Nuevo Stand
          </button>
        )}
      </div>

      {isAdding && (
        <div className="mb-10 bg-white p-8 rounded-3xl border border-emerald-100 shadow-sm animate-in fade-in slide-in-from-top-4">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">Configurar Nuevo Stand</h3>
            <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <form onSubmit={handleAddSpace} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              {/* SELECTOR DE EVENTO */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 tracking-tight uppercase">Evento Subsonic Asociado</label>
                <select 
                  required
                  value={newSpaceData.eventId}
                  onChange={e => setNewSpaceData({...newSpaceData, eventId: e.target.value})}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white shadow-sm"
                >
                  {events.map(event => (
                    <option key={event.id} value={event.id}>{event.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 tracking-tight uppercase">Nombre del Stand</label>
                <input 
                  type="text" required 
                  value={newSpaceData.name} 
                  onChange={e => setNewSpaceData({...newSpaceData, name: e.target.value})}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-50/50"
                  placeholder="Ej: Techno-Tacos Corner"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1 uppercase">Precio de Alquiler (€)</label>
                  <input 
                    type="number" step="0.01" required 
                    value={newSpaceData.price || ''} 
                    onChange={e => setNewSpaceData({...newSpaceData, price: Number(e.target.value)})}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-50/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1 uppercase">Categoría</label>
                  <select 
                    value={newSpaceData.type} 
                    onChange={e => setNewSpaceData({...newSpaceData, type: e.target.value})}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                  >
                    <option value="food">Comida</option>
                    <option value="beverage">Bebida</option>
                    <option value="merchandise">Merchandising</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition flex items-center justify-center disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : 'Publicar Stand'}
                </button>
              </div>
            </div>

            <div className="hidden md:block bg-gray-50 border border-gray-200 rounded-2xl p-6">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Ubicación Prevista</h4>
              <div className="space-y-3">
                <input 
                  type="text" 
                  value={newSpaceData.location} 
                  onChange={e => setNewSpaceData({...newSpaceData, location: e.target.value})}
                  className="w-full p-2 text-sm border-b border-gray-300 bg-transparent outline-none focus:border-emerald-500"
                  placeholder="Ej: Junto a Main Stage"
                />
                <p className="text-[10px] text-gray-400 italic">La ubicación aparecerá en el Radar de Amigos del usuario final.</p>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* LISTADO DE ESPACIOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {spaces.map(space => {
          const associatedEvent = events.find(e => e.id === space.eventId);
          return (
            <div key={space.id} className="bg-white border border-gray-200 p-5 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-xl ${
                  space.type === 'food' ? 'bg-orange-50 text-orange-600' :
                  space.type === 'beverage' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                }`}>
                  <Store className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">{space.name}</h4>
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center text-[10px] font-black text-indigo-500 uppercase tracking-tight">
                      <Calendar className="w-3 h-3 mr-1" />
                      {associatedEvent?.name || 'Evento sin asignar'}
                    </div>
                    <div className="flex items-center text-xs text-gray-400 font-medium space-x-2">
                      <span className="text-emerald-600 font-bold">€{space.price}</span>
                      <span>•</span>
                      <span className="uppercase tracking-wide">{space.location}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => handleDelete(space.id, space.name)}
                className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};