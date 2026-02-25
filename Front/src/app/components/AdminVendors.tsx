import React, { useState, useEffect } from 'react';
import { VendorSpace, mockVendorSpaces } from '../data/mockData';

export const AdminVendors = () => {
  const [spaces, setSpaces] = useState<VendorSpace[]>(() => {
    const saved = localStorage.getItem('admin_spaces');
    return saved ? JSON.parse(saved) : mockVendorSpaces;
  });

  const [isAdding, setIsAdding] = useState(false);
  const [newSpace, setNewSpace] = useState({ name: '', price: 0, location: '', type: 'food' });

  useEffect(() => {
    localStorage.setItem('admin_spaces', JSON.stringify(spaces));
  }, [spaces]);

  const handleAddSpace = (e: React.FormEvent) => {
    e.preventDefault();
    const space: VendorSpace = {
      ...mockVendorSpaces[0],
      id: `s-${Date.now()}`,
      name: newSpace.name,
      price: newSpace.price,
      location: newSpace.location,
      type: newSpace.type,
      available: true
    };
    setSpaces([space, ...spaces]);
    setIsAdding(false);
    setNewSpace({ name: '', price: 0, location: '', type: 'food' });
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm text-gray-800 mt-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Espacios Disponibles</h2>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          {isAdding ? 'Cerrar' : '+ Añadir Espacio'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddSpace} className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 grid grid-cols-2 gap-3">
          <input 
            placeholder="Nombre del Stand" 
            className="border p-2 rounded text-sm col-span-2"
            value={newSpace.name}
            onChange={e => setNewSpace({...newSpace, name: e.target.value})}
          />
          <input 
            type="number" placeholder="Precio" 
            className="border p-2 rounded text-sm"
            onChange={e => setNewSpace({...newSpace, price: Number(e.target.value)})}
          />
          <select 
            className="border p-2 rounded text-sm"
            onChange={e => setNewSpace({...newSpace, type: e.target.value})}
          >
            <option value="food">Comida</option>
            <option value="beverage">Bebida</option>
            <option value="merchandise">Merchandising</option>
          </select>
          <button type="submit" className="col-span-2 bg-emerald-600 text-white py-2 rounded text-sm font-bold">Crear Espacio</button>
        </form>
      )}

      <div className="grid grid-cols-1 gap-3">
        {spaces.map(space => (
          <div key={space.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50">
            <div>
              <p className="font-medium">{space.name}</p>
              <p className="text-xs text-gray-500">{space.location} • ${space.price}</p>
            </div>
            <button onClick={() => setSpaces(spaces.filter(s => s.id !== space.id))} className="text-red-500 text-sm">Eliminar</button>
          </div>
        ))}
      </div>
    </div>
  );
};