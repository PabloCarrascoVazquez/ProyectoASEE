import React, { useState } from 'react';
import { Event, mockEvents } from '../data/mockData';
import { ArrowLeft, Trash2, Plus, Calendar, X, ImageIcon, MapPin } from 'lucide-react';

interface AdminEventsProps {
  onBack: () => void;
}

export const AdminEvents: React.FC<AdminEventsProps> = ({ onBack }) => {
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [showForm, setShowForm] = useState(false);

  // Estados del formulario de Evento
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  
  // Estado para los Espacios (dentro del evento)
  const [spaces, setSpaces] = useState<{ id: string; name: string; type: string }[]>([]);

  const addSpace = () => {
    const newSpace = { id: Date.now().toString(), name: '', type: 'Escenario' };
    setSpaces([...spaces, newSpace]);
  };

  const updateSpace = (id: string, field: 'name' | 'type', value: string) => {
    setSpaces(spaces.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const removeSpace = (id: string) => {
    setSpaces(spaces.filter(s => s.id !== id));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !date) return;

    const newEvent: Event = {
      id: `e-${Date.now()}`,
      name,
      date,
      image: imageUrl || 'https://images.unsplash.com/photo-1459749411177-042180ce673c?w=800',
      description,
      artists: [], // Se podrían añadir igual que los espacios
      services: spaces.map(s => s.name), // Usamos el array de espacios aquí
      ticketPrices: [],
      gallery: [],
      mapImage: ''
    };

    setEvents([newEvent, ...events]);
    setShowForm(false);
    // Resetear estados
    setName(''); setDate(''); setImageUrl(''); setSpaces([]);
  };

  const handleDeleteEvent = (id: string, title: string) => {
    if (window.confirm(`¿Eliminar definitivamente el evento "${title}"?`)) {
      setEvents(events.filter(e => e.id !== id));
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
          <Calendar className="w-8 h-8 text-indigo-600" />
          <h2 className="text-3xl font-bold">Gestión de Eventos</h2>
        </div>
        {!showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="bg-indigo-600 text-white px-6 py-2 rounded-full flex items-center shadow-md hover:bg-indigo-700 transition font-bold"
          >
            <Plus className="w-5 h-5 mr-2" /> Nuevo Evento
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-10 bg-gray-50 p-8 rounded-3xl border border-gray-200 shadow-sm animate-in fade-in slide-in-from-top-4">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">Configuración del Evento</h3>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Columna Imagen */}
              <div className="flex flex-col space-y-4">
                <div className="aspect-video bg-white border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-center overflow-hidden">
                  {imageUrl ? (
                    <img src={imageUrl} className="w-full h-full object-cover" alt="Preview" />
                  ) : (
                    <ImageIcon className="w-12 h-12 text-gray-200" />
                  )}
                </div>
                <input 
                  type="text" placeholder="URL del póster" value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full p-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Columna Datos Principales */}
              <div className="md:col-span-2 space-y-4">
                <input 
                  type="text" required placeholder="Título del Evento" value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-4 text-xl font-bold border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input 
                    type="date" required value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl outline-none"
                  />
                  <select className="w-full p-3 border border-gray-300 rounded-xl bg-white">
                    <option>Festival</option>
                    <option>Concierto</option>
                    <option>Club</option>
                  </select>
                </div>
                <textarea 
                  placeholder="Descripción corta..." value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl h-24 outline-none"
                />
              </div>
            </div>

            {/* SECCIÓN DE ESPACIOS */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-gray-700 flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-indigo-500" /> Espacios del Evento
                </h4>
                <button 
                  type="button" onClick={addSpace}
                  className="text-sm bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-lg font-bold hover:bg-indigo-100 transition"
                >
                  + Añadir Espacio
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {spaces.map((space) => (
                  <div key={space.id} className="flex items-center gap-2 bg-white p-3 rounded-xl border border-gray-200">
                    <input 
                      type="text" placeholder="Nombre (Ej: Main Stage)" 
                      value={space.name} onChange={(e) => updateSpace(space.id, 'name', e.target.value)}
                      className="flex-1 text-sm outline-none font-medium"
                    />
                    <select 
                      value={space.type} onChange={(e) => updateSpace(space.id, 'type', e.target.value)}
                      className="text-xs bg-gray-50 border-none rounded p-1"
                    >
                      <option value="Escenario">Escenario</option>
                      <option value="Bar">Bar/Barra</option>
                      <option value="VIP">Zona VIP</option>
                      <option value="Market">Tienda/Merch</option>
                    </select>
                    <button type="button" onClick={() => removeSpace(space.id)} className="text-red-300 hover:text-red-500">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 font-bold text-gray-400">Cancelar</button>
              <button type="submit" className="bg-indigo-600 text-white px-10 py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition">
                Publicar Evento
              </button>
            </div>
          </form>
        </div>
      )}

      {/* LISTADO DE EVENTOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.map(event => (
          <div key={event.id} className="bg-white border border-gray-200 rounded-3xl overflow-hidden flex shadow-sm hover:shadow-md transition-all group">
            <img src={event.image} className="w-32 h-auto object-cover" alt="" />
            <div className="p-4 flex-1 flex justify-between items-center">
              <div>
                <h4 className="font-bold text-lg text-gray-800">{event.name}</h4>
                <p className="text-sm text-gray-400">{event.date}</p>
                <div className="flex mt-2 gap-1">
                   <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-bold">
                     {event.services?.length || 0} Espacios
                   </span>
                </div>
              </div>
              <button 
                onClick={() => handleDeleteEvent(event.id, event.name)}
                className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};