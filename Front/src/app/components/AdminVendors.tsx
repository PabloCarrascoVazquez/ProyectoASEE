import React, { useState, useEffect } from 'react';
import { VendorSpace, mockVendorSpaces } from '../data/mockData';
import { vendorService } from '../services/vendorService';
import { Loader2, Trash2, Plus, Store, X } from 'lucide-react';
import { toast } from 'sonner';


export const AdminVendors: React.FC = () => {
  // --- ESTADOS DE DATOS ---
  const [spaces, setSpaces] = useState<VendorSpace[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // --- ESTADOS DEL FORMULARIO ---
  const [isAdding, setIsAdding] = useState(false);
  const [newSpaceData, setNewSpaceData] = useState({ 
    name: '', 
    price: 0, 
    location: '', 
    type: 'food' 
  });

  // --- CARGA INICIAL ---
  useEffect(() => {
    const loadSpaces = async () => {
      try {
        const data = await vendorService.getAll();
        setSpaces(data);
      } catch (error) {
        toast.error('Error al cargar los espacios');
      } finally {
        setLoading(false);
      }
    };
    loadSpaces();
  }, []);

  // --- MANEJADORES ---
  const handleAddSpace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpaceData.name || newSpaceData.price <= 0) {
        toast.error("Por favor, completa los campos correctamente");
        return;
    }

    setIsSaving(true);

    const space: VendorSpace = {
      ...mockVendorSpaces[0], // Copiamos propiedades por defecto (size, dimensions, etc)
      id: `s-${Date.now()}`,
      name: newSpaceData.name,
      price: newSpaceData.price,
      location: newSpaceData.location || 'Zona General',
      type: newSpaceData.type,
      available: true
    };

    try {
      const savedSpace = await vendorService.create(space);
      setSpaces([savedSpace, ...spaces]);
      toast.success('Espacio creado con éxito');
      setIsAdding(false);
      setNewSpaceData({ name: '', price: 0, location: '', type: 'food' });
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
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-gray-200 mt-6">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-2" />
        <p className="text-gray-500 text-sm">Cargando mapa de espacios...</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm text-gray-800 mt-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <Store className="w-5 h-5 text-emerald-600" />
          <h2 className="text-xl font-bold text-gray-900">Espacios Disponibles</h2>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center ${
            isAdding 
            ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' 
            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
          }`}
        >
          {isAdding ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
          {isAdding ? 'Cancelar' : 'Añadir Espacio'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddSpace} className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="col-span-1 md:col-span-2">
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Nombre del Stand</label>
            <input 
                placeholder="Ej: Burger Master VIP" 
                className="w-full border p-2.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                value={newSpaceData.name}
                onChange={e => setNewSpaceData({...newSpaceData, name: e.target.value})}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Precio (€)</label>
            <input 
                type="number" placeholder="0.00" 
                className="w-full border p-2.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                value={newSpaceData.price || ''}
                onChange={e => setNewSpaceData({...newSpaceData, price: Number(e.target.value)})}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Tipo de Negocio</label>
            <select 
                className="w-full border p-2.5 rounded-lg text-sm outline-none bg-white focus:ring-2 focus:ring-emerald-500"
                value={newSpaceData.type}
                onChange={e => setNewSpaceData({...newSpaceData, type: e.target.value})}
            >
                <option value="food">Comida</option>
                <option value="beverage">Bebida</option>
                <option value="merchandise">Merchandising</option>
            </select>
          </div>
          <button 
            type="submit" 
            disabled={isSaving}
            className="md:col-span-2 bg-emerald-600 text-white py-3 rounded-lg text-sm font-bold shadow-md hover:bg-emerald-700 transition flex items-center justify-center disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {isSaving ? 'Creando...' : 'Confirmar y Crear Espacio'}
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 gap-3">
        {spaces.length === 0 ? (
            <p className="text-center py-8 text-gray-400 text-sm italic">No hay espacios registrados.</p>
        ) : (
            spaces.map(space => (
                <div key={space.id} className="flex justify-between items-center p-4 border rounded-xl hover:bg-gray-50 transition-colors group">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${
                        space.type === 'food' ? 'bg-orange-50 text-orange-600' :
                        space.type === 'beverage' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                    }`}>
                        <Store className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="font-bold text-gray-900">{space.name}</p>
                        <p className="text-xs text-gray-500 font-medium">
                            {space.location} • <span className="text-emerald-600">€{space.price}</span>
                        </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDelete(space.id, space.name)} 
                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    title="Eliminar espacio"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))
        )}
      </div>
    </div>
  );
};