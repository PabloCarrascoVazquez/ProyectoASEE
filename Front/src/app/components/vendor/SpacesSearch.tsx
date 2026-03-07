import React, { useState, useEffect } from 'react';
import { VendorSpace, Event } from '../../data/mockData';
import { vendorService } from '../../services/vendorService';
import { eventService } from '../../services/eventService';
import { Search, MapPin, Loader2, Filter } from 'lucide-react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export const SpacesSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [eventFilter, setEventFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  
  const [spaces, setSpaces] = useState<VendorSpace[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [spacesData, eventsData] = await Promise.all([
          vendorService.getAll(),
          eventService.getAll()
        ]);
        
        // Log de depuración: Abre la consola (F12) para ver si los IDs coinciden
        console.log('Spaces loaded:', spacesData);
        console.log('Events loaded:', eventsData);
        
        setSpaces(spacesData);
        setEvents(eventsData);
      } catch (error) {
        toast.error('Error de sincronización con la base de datos');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // FILTRADO ROBUSTO CON NORMALIZACIÓN DE IDs
  const filteredSpaces = spaces.filter((space) => {
    const matchesSearch = space.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Normalizamos a String y quitamos espacios para evitar fallos de "1" vs 1
    const sEventId = space.eventId ? String(space.eventId).trim() : '';
    const fEventId = String(eventFilter).trim();

    const matchesEvent = fEventId === 'all' || sEventId === fEventId;
    
    const matchesType = typeFilter === 'all' || 
                        space.type.toLowerCase() === typeFilter.toLowerCase();
    
    return matchesSearch && matchesEvent && matchesType;
  });

  if (loading) return (
    <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center">
      <Loader2 className="w-12 h-12 text-[#00F0FF] animate-spin mb-4" />
      <p className="text-[#94A3B8] font-black tracking-widest uppercase italic">Nexus Scanning...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0B0F19] p-8">
      <div className="max-w-7xl mx-auto py-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-5xl font-black text-white uppercase italic tracking-tighter mb-12">
            DISCOVER <span className="text-[#FF2A5F]">SPACES</span>
          </h1>
        </motion.div>

        {/* CONTROLES DE FILTRO */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-12">
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Nombre del stand..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[#1A2235] border border-white/5 text-white outline-none focus:border-[#FF2A5F]/50 transition-all placeholder:text-gray-600 font-bold"
            />
          </div>
          
          <select
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value)}
            className="bg-[#1A2235] border border-white/5 text-gray-300 rounded-2xl px-4 py-4 outline-none focus:border-[#00F0FF]/50 cursor-pointer font-bold uppercase text-xs tracking-wider"
          >
            <option value="all">TODOS LOS EVENTOS</option>
            {events.map(e => (
              <option key={e.id} value={String(e.id)}>
                {e.name.toUpperCase()}
              </option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-[#1A2235] border border-white/5 text-gray-300 rounded-2xl px-4 py-4 outline-none focus:border-[#FF2A5F]/50 cursor-pointer font-bold uppercase text-xs tracking-wider"
          >
            <option value="all">TODAS LAS CATEGORÍAS</option>
            <option value="food">COMIDA</option>
            <option value="beverage">BEBIDA</option>
            <option value="merchandise">MERCHANDISING</option>
          </select>
        </div>

        {/* GRID DE RESULTADOS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredSpaces.map((space) => {
            // Buscamos el evento normalizando IDs para la etiqueta
            const event = events.find(e => String(e.id) === String(space.eventId));
            
            return (
              <motion.div
                key={space.id}
                whileHover={{ y: -10 }}
                onClick={() => navigate(`/vendor/space/${space.id}`)}
                className="bg-[#1A2235] rounded-3xl overflow-hidden border border-white/5 cursor-pointer hover:border-[#00F0FF]/40 transition-all group"
              >
                <div className="h-48 relative overflow-hidden">
                  <img 
                    src={space.image} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    alt={space.name} 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A2235] via-transparent to-transparent opacity-60" />
                  
                  {/* ETIQUETA DE EVENTO ASOCIADO */}
                  <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black text-[#00F0FF] uppercase border border-[#00F0FF]/30 shadow-lg">
                    {event ? event.name : "EVENTO NO VINCULADO"}
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-black text-white uppercase mb-4 leading-tight group-hover:text-[#FF2A5F] transition-colors tracking-tight">
                    {space.name}
                  </h3>
                  
                  <div className="flex items-center text-xs text-gray-400 font-bold mb-6 italic">
                    <MapPin className="w-4 h-4 mr-1 text-[#FF2A5F]" /> {space.location}
                  </div>

                  <div className="flex justify-between items-center border-t border-white/5 pt-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-500 font-black uppercase">Inversión</span>
                      <span className="text-2xl font-black text-[#00F0FF]">€{space.price}</span>
                    </div>
                    <span className="px-3 py-1 bg-white/5 rounded-lg text-[10px] font-black text-gray-500 uppercase tracking-widest border border-white/5">
                      {space.size}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
          
          {filteredSpaces.length === 0 && (
            <div className="col-span-full text-center py-20 bg-[#1A2235]/30 rounded-[3rem] border border-dashed border-white/5">
               <Filter className="w-16 h-16 text-gray-600 mx-auto mb-4 opacity-20" />
               <p className="text-gray-500 font-black uppercase tracking-widest text-sm">No se han detectado stands con estos parámetros</p>
               <button 
                 onClick={() => {setSearchTerm(''); setEventFilter('all'); setTypeFilter('all');}}
                 className="mt-4 text-[#FF2A5F] text-xs font-bold hover:underline uppercase"
               >
                 Limpiar filtros
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};