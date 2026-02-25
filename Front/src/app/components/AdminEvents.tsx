import React, { useState, useEffect } from 'react';
import { Event, mockEvents } from '../data/mockData'; // <--- Ajusta según tu carpeta

export const AdminEvents = () => {
  const [events, setEvents] = useState<Event[]>(() => {
    const saved = localStorage.getItem('admin_events');
    return saved ? JSON.parse(saved) : mockEvents;
  });

  const [isAdding, setIsAdding] = useState(false);
  const [newEvent, setNewEvent] = useState({ name: '', date: '', description: '' });

  useEffect(() => {
    localStorage.setItem('admin_events', JSON.stringify(events));
  }, [events]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.name) return;

    const eventToAdd: Event = {
      ...mockEvents[0],
      id: Date.now().toString(),
      name: newEvent.name,
      date: newEvent.date || new Date().toISOString().split('T')[0],
      description: newEvent.description
    };

    setEvents([eventToAdd, ...events]);
    setNewEvent({ name: '', date: '', description: '' });
    setIsAdding(false);
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm text-gray-800">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Gestión de Eventos</h2>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          {isAdding ? 'Cerrar' : '+ Añadir Evento'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
          <input 
            className="w-full border border-gray-300 p-2 rounded text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="Nombre del evento"
            value={newEvent.name}
            onChange={e => setNewEvent({...newEvent, name: e.target.value})}
          />
          <input 
            type="date"
            className="w-full border border-gray-300 p-2 rounded text-sm outline-none"
            value={newEvent.date}
            onChange={e => setNewEvent({...newEvent, date: e.target.value})}
          />
          <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded text-sm font-bold">Guardar</button>
        </form>
      )}

      <div className="divide-y divide-gray-100">
        {events.map(event => (
          <div key={event.id} className="py-3 flex justify-between items-center">
            <div>
              <p className="font-semibold text-gray-900">{event.name}</p>
              <p className="text-xs text-gray-500">{event.date}</p>
            </div>
            <button onClick={() => setEvents(events.filter(e => e.id !== event.id))} className="text-red-500 text-sm hover:underline">Borrar</button>
          </div>
        ))}
      </div>
    </div>
  );
};