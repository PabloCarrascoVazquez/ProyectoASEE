import React, { useState, useEffect } from 'react';
import { MerchandiseItem, mockMerchandise } from '../data/mockData';
import { ArrowLeft, Trash2, Plus, ShoppingBag, X, ImageIcon } from 'lucide-react';

interface AdminMerchProps {
  onBack: () => void;
}

export const AdminMerch: React.FC<AdminMerchProps> = ({ onBack }) => {
  const [items, setItems] = useState<MerchandiseItem[]>(() => {
    const saved = localStorage.getItem('subsonic_merch');
    return saved ? JSON.parse(saved) : mockMerchandise;
  });

  useEffect(() => {
    localStorage.setItem('subsonic_merch', JSON.stringify(items));
  }, [items]);

  const [showForm, setShowForm] = useState(false);

  // Estados para el formulario
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('clothing');
  const [imageUrl, setImageUrl] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;

    const newItem: MerchandiseItem = {
      id: `m-${Date.now()}`,
      name,
      price: Number(price),
      category,
      image: imageUrl || 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=400', // Imagen por defecto si no pone una
    };

    setItems([newItem, ...items]);
    
    // Resetear y cerrar
    setName('');
    setPrice('');
    setImageUrl('');
    setShowForm(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`¿Eliminar "${name}" del inventario?`)) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-white p-8 text-gray-900">
      <button 
        onClick={onBack} 
        className="flex items-center text-gray-500 hover:text-indigo-600 mb-6 transition-colors font-medium"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Volver al panel
      </button>

      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-3">
          <ShoppingBag className="w-8 h-8 text-indigo-600" />
          <h2 className="text-3xl font-bold">Inventario de Merchandising</h2>
        </div>
        {!showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="bg-indigo-600 text-white px-6 py-2 rounded-full flex items-center shadow-md hover:bg-indigo-700 transition font-bold"
          >
            <Plus className="w-5 h-5 mr-2" /> Nuevo Producto
          </button>
        )}
      </div>

      {/* FORMULARIO DE AÑADIR */}
      {showForm && (
        <div className="mb-10 bg-gray-50 p-6 rounded-3xl border border-gray-200 animate-in fade-in slide-in-from-top-4">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">Detalles del Nuevo Producto</h3>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Preview de imagen */}
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl p-4 bg-white aspect-square overflow-hidden">
              {imageUrl ? (
                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover rounded-xl" />
              ) : (
                <div className="text-center text-gray-400">
                  <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-20" />
                  <p className="text-xs">Introduce una URL para ver la previsualización</p>
                </div>
              )}
            </div>

            <div className="md:col-span-2 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Título del Producto</label>
                <input 
                  type="text" required value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Ej: Camiseta Subsonic 2026"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Precio (€)</label>
                  <input 
                    type="number" required value={price} onChange={(e) => setPrice(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="29.99"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Categoría</label>
                  <select 
                    value={category} onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  >
                    <option value="clothing">Ropa</option>
                    <option value="accessories">Accesorios</option>
                    <option value="collectibles">Coleccionables</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">URL de la Imagen</label>
                <input 
                  type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition">
                  Guardar Producto
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 border border-gray-300 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition">
                  Cancelar
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* LISTADO DE PRODUCTOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map(item => (
          <div key={item.id} className="bg-white border border-gray-200 p-4 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center space-x-4">
              <img src={item.image} alt={item.name} className="w-20 h-20 rounded-xl object-cover border border-gray-100" />
              <div>
                <h4 className="font-bold text-gray-800 text-lg leading-tight">{item.name}</h4>
                <p className="text-indigo-600 font-bold text-xl">${item.price}</p>
                <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                  {item.category}
                </span>
              </div>
            </div>
            <button 
              onClick={() => handleDelete(item.id, item.name)}
              className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};