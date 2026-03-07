import React, { useState, useEffect } from 'react';
import { VendorSpace, mockVendorSpaces } from '../data/mockData';
import { vendorService } from '../services/vendorService';
import { Loader2, Trash2, Plus, Store, X, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';


export const AdminVendors: React.FC = () => {
  const navigate = useNavigate();
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
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-3xl shadow-xl flex flex-col items-center border border-gray-100">
          <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mb-4" />
          <p className="text-gray-500 font-bold tracking-tight">Sincronizando espacios...</p>
          <div className="mt-2 w-48 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 animate-progress origin-left w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-gray-900">
      {/* CABECERA Y NAVEGACIÓN */}
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
            <h2 className="text-3xl font-bold">Gestión de Espacios</h2>
            <p className="text-gray-500 text-sm">Configura y asigna stands para vendedores y proveedores.</p>
          </div>
        </div>
        
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="bg-emerald-600 text-white px-6 py-3 rounded-full flex items-center shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all font-bold"
          >
            <Plus className="w-5 h-5 mr-2" /> Añadir Espacio
          </button>
        )}
      </div>

      {/* FORMULARIO DE NUEVO ESPACIO */}
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
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 tracking-tight">Nombre del Establecimiento / Stand</label>
                <input 
                  type="text" required 
                  value={newSpaceData.name} 
                  onChange={e => setNewSpaceData({...newSpaceData, name: e.target.value})}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-50/50"
                  placeholder="Ej: Burger Master VIP Stage"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Precio de Alquiler (€)</label>
                  <input 
                    type="number" step="0.01" required 
                    value={newSpaceData.price || ''} 
                    onChange={e => setNewSpaceData({...newSpaceData, price: Number(e.target.value)})}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-50/50"
                    placeholder="500.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Tipo de Servicio</label>
                  <select 
                    value={newSpaceData.type} 
                    onChange={e => setNewSpaceData({...newSpaceData, type: e.target.value})}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white shadow-sm"
                  >
                    <option value="food">Comida / Foodtruck</option>
                    <option value="beverage">Bebida / Barra</option>
                    <option value="merchandise">Merchandising / Tienda</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Ubicación en el Recinto</label>
                <input 
                  type="text" 
                  value={newSpaceData.location} 
                  onChange={e => setNewSpaceData({...newSpaceData, location: e.target.value})}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-50/50"
                  placeholder="Ej: Zona Norte, junto al Escenario Principal"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition flex items-center justify-center disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                  {isSaving ? 'Registrando...' : 'Confirmar Registro'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsAdding(false)}
                  className="px-6 py-3 border border-gray-200 rounded-xl font-bold text-gray-400 hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
              </div>
            </div>

            {/* CARD PREVIEW */}
            <div className="hidden md:block bg-emerald-50/50 border border-emerald-100 rounded-2xl p-6">
              <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-4">Vista Previa</h4>
              <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-sm">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center mb-3">
                  <Store className="w-6 h-6" />
                </div>
                <p className="font-bold text-gray-800">{newSpaceData.name || 'Nombre del Stand'}</p>
                <p className="text-emerald-600 font-bold text-lg">€{newSpaceData.price || '0.00'}</p>
                <div className="mt-2 text-[10px] text-gray-400 font-medium uppercase">{newSpaceData.type}</div>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* LISTADO DE ESPACIOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {spaces.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
             <Store className="w-12 h-12 text-gray-200 mx-auto mb-4" />
             <p className="text-gray-400 font-medium">No hay espacios registrados todavía.</p>
          </div>
        ) : (
          spaces.map(space => (
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
                  <div className="flex items-center text-xs text-gray-400 font-medium space-x-2">
                    <span className="text-emerald-600 font-bold text-sm">€{space.price}</span>
                    <span>•</span>
                    <span className="uppercase tracking-wide">{space.location}</span>
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
          ))
        )}
      </div>
    </div>
  );
};