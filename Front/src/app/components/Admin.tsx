import React, { useState } from 'react';
import { mockEvents, mockMerchandise } from '../data/mockData';
import { Event, MerchandiseItem } from '../data/mockData';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export const Admin: React.FC = () => {
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [merchandise, setMerchandise] = useState<MerchandiseItem[]>(mockMerchandise);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [editingMerch, setEditingMerch] = useState<MerchandiseItem | null>(null);

  const handleSaveEvent = (updatedEvent: Event) => {
    setEvents(events.map(e => e.id === updatedEvent.id ? updatedEvent : e));
    setEditingEvent(null);
    toast.success('Evento actualizado');
  };

  const handleSaveMerch = (updatedMerch: MerchandiseItem) => {
    setMerchandise(merchandise.map(m => m.id === updatedMerch.id ? updatedMerch : m));
    setEditingMerch(null);
    toast.success('Producto actualizado');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-950 to-black">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl mb-2 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
            Panel de Administración
          </h1>
          <p className="text-xl text-gray-400">Gestiona eventos y merchandising</p>
        </motion.div>

        {/* Events Section */}
        <div className="mb-12">
          <h2 className="text-2xl mb-6 text-white">Eventos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-pink-500/30 rounded-2xl p-6"
              >
                <h3 className="text-xl mb-2 text-white">{event.name}</h3>
                <p className="text-gray-400 mb-4">{event.description}</p>
                <button
                  onClick={() => setEditingEvent(event)}
                  className="px-4 py-2 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 text-pink-400 transition-all"
                >
                  Editar
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Merchandise Section */}
        <div>
          <h2 className="text-2xl mb-6 text-white">Merchandising</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {merchandise.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-pink-500/30 rounded-2xl p-6"
              >
                <h3 className="text-xl mb-2 text-white">{item.name}</h3>
                <p className="text-gray-400 mb-4">€{item.price}</p>
                <button
                  onClick={() => setEditingMerch(item)}
                  className="px-4 py-2 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 text-pink-400 transition-all"
                >
                  Editar
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Edit Modal for Event */}
        {editingEvent && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-purple-900 to-pink-900 border-2 border-pink-500/50 rounded-2xl p-8 max-w-md w-full"
            >
              <h2 className="text-2xl mb-4 text-white">Editar Evento</h2>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                handleSaveEvent({
                  ...editingEvent,
                  name: formData.get('name') as string,
                  description: formData.get('description') as string,
                });
              }}>
                <input
                  name="name"
                  defaultValue={editingEvent.name}
                  className="w-full mb-4 px-4 py-3 rounded-xl bg-purple-900/30 border border-pink-500/30 text-white"
                />
                <textarea
                  name="description"
                  defaultValue={editingEvent.description}
                  className="w-full mb-4 px-4 py-3 rounded-xl bg-purple-900/30 border border-pink-500/30 text-white"
                />
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-pink-500 text-white"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => setEditingEvent(null)}
                    className="px-4 py-2 rounded-lg bg-gray-500 text-white"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Edit Modal for Merchandise */}
        {editingMerch && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-purple-900 to-pink-900 border-2 border-pink-500/50 rounded-2xl p-8 max-w-md w-full"
            >
              <h2 className="text-2xl mb-4 text-white">Editar Producto</h2>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                handleSaveMerch({
                  ...editingMerch,
                  name: formData.get('name') as string,
                  price: parseFloat(formData.get('price') as string),
                });
              }}>
                <input
                  name="name"
                  defaultValue={editingMerch.name}
                  className="w-full mb-4 px-4 py-3 rounded-xl bg-purple-900/30 border border-pink-500/30 text-white"
                />
                <input
                  name="price"
                  type="number"
                  defaultValue={editingMerch.price}
                  className="w-full mb-4 px-4 py-3 rounded-xl bg-purple-900/30 border border-pink-500/30 text-white"
                />
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-pink-500 text-white"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => setEditingMerch(null)}
                    className="px-4 py-2 rounded-lg bg-gray-500 text-white"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};