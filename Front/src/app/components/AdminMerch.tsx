import React, { useState } from 'react';
import { MerchandiseItem, mockMerchandise } from '../data/mockData';

export const AdminMerch = () => {
  const [items, setItems] = useState<MerchandiseItem[]>(mockMerchandise);
  const [filter, setFilter] = useState('all');

  // Estado para el nuevo item
  const [newItem, setNewItem] = useState({ name: '', price: 0, category: 'clothing' });

  const addItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || newItem.price <= 0) return;

    const item: MerchandiseItem = {
      id: `m${Math.random().toString(36).substr(2, 9)}`,
      name: newItem.name,
      price: newItem.price,
      category: newItem.category,
      image: 'https://images.unsplash.com/photo-1605329540493-6741250d2bee?w=400', // Imagen por defecto
    };

    setItems([...items, item]);
    setNewItem({ name: '', price: 0, category: 'clothing' });
  };

  const deleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const filteredItems = filter === 'all' 
    ? items 
    : items.filter(item => item.category === filter);

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">Inventario de Merchandising</h3>
        <select 
          className="border rounded p-1 text-sm"
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">Todas las categorías</option>
          <option value="clothing">Ropa</option>
          <option value="accessories">Accesorios</option>
          <option value="collectibles">Coleccionables</option>
        </select>
      </div>

      {/* Formulario rápido para añadir producto */}
      <form onSubmit={addItem} className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-6 bg-gray-50 p-3 rounded">
        <input 
          type="text" 
          placeholder="Nombre producto"
          className="border p-2 rounded text-sm"
          value={newItem.name}
          onChange={(e) => setNewItem({...newItem, name: e.target.value})}
        />
        <input 
          type="number" 
          placeholder="Precio"
          className="border p-2 rounded text-sm"
          value={newItem.price || ''}
          onChange={(e) => setNewItem({...newItem, price: Number(e.target.value)})}
        />
        <select 
          className="border p-2 rounded text-sm"
          value={newItem.category}
          onChange={(e) => setNewItem({...newItem, category: e.target.value})}
        >
          <option value="clothing">Ropa</option>
          <option value="accessories">Accesorios</option>
          <option value="collectibles">Coleccionables</option>
        </select>
        <button type="submit" className="bg-indigo-600 text-white rounded py-2 hover:bg-indigo-700 transition">
          + Añadir
        </button>
      </form>

      {/* Lista de productos */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredItems.map(item => (
          <div key={item.id} className="flex items-center justify-between p-3 border-b hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <img src={item.image} alt={item.name} className="w-10 h-10 rounded object-cover" />
              <div>
                <p className="font-medium text-sm">{item.name}</p>
                <p className="text-xs text-gray-500 uppercase">{item.category} • ${item.price}</p>
              </div>
            </div>
            <button 
              onClick={() => deleteItem(item.id)}
              className="text-red-400 hover:text-red-600 p-2"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};