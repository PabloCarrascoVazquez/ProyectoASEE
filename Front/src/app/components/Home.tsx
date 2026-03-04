import React, { useState, useEffect } from 'react';
import { Event } from '../data/mockData';
import { eventService } from '../services/eventService'; // 1. Usamos el servicio centralizado
import { Search, Calendar, Music, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export const Home: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true); // Estado de carga inicial
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const navigate = useNavigate();

  // --- CARGA DE DATOS ---
  const loadData = async () => {
    try {
      const data = await eventService.getAll();
      setEvents(data);
    } catch (error) {
      toast.error('Error al sincronizar con el servidor de eventos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Sincronización si el admin cambia algo en otra pestaña
    const syncEvents = (e: StorageEvent) => {
      if (e.key === 'subsonic_events') loadData();
    };
    window.addEventListener('storage', syncEvents);
    return () => window.removeEventListener('storage', syncEvents);
  }, []);

  // --- FILTRADO DINÁMICO ---
  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = !dateFilter || event.date === dateFilter;
    return matchesSearch && matchesDate;
  });

  // --- RENDER DE CARGA ---
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center">
        <Loader2 className="w-16 h-16 text-[#FF2A5F] animate-spin mb-4" />
        <p className="text-[#94A3B8] font-bold tracking-widest uppercase">Cargando Line-up 2026...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F19]">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative h-[600px] flex items-center justify-center overflow-hidden"
      >
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1624929303661-22c5bce0169b?w=1200"
            alt="Festival"
            className="w-full h-full object-cover grayscale opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B0F19]/80 via-[#1A2235]/50 to-[#0B0F19]" />
        </div>

        <div className="relative z-10 text-center px-4">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <Music className="w-20 h-20 mx-auto mb-6 text-[#FF2A5F] drop-shadow-[0_0_15px_rgba(255,42,95,0.8)]" />
            <h1 className="text-6xl md:text-8xl mb-4 bg-gradient-to-r from-[#FF2A5F] to-[#00F0FF] bg-clip-text text-transparent font-black tracking-tighter">
              SUBSONIC
            </h1>
            <p className="text-2xl md:text-3xl text-[#94A3B8] mb-8 font-light tracking-[0.5em]">
              FESTIVAL 2026
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Filtros */}
      <div className="max-w-7xl mx-auto px-4 py-8 -mt-16 relative z-20">
        <div className="flex flex-col md:flex-row gap-4 mb-12">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#FF2A5F] w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por artista o evento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[#1A2235]/80 backdrop-blur-xl border border-[#FF2A5F]/30 text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#FF2A5F]/50 shadow-2xl"
            />
          </div>

          <div className="relative md:w-64">
            <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#00F0FF] w-5 h-5" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[#1A2235]/80 backdrop-blur-xl border border-[#00F0FF]/30 text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#00F0FF]/50"
            />
          </div>
        </div>

        {/* Grid de Eventos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              onClick={() => navigate(`/event/${event.id}`)}
              className="group cursor-pointer"
            >
              <div className="relative rounded-3xl overflow-hidden bg-[#1A2235] border border-[#FF2A5F]/20 hover:border-[#FF2A5F]/60 transition-all duration-500 hover:shadow-[0_0_30px_rgba(255,42,95,0.2)]">
                <div className="relative h-72 overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A2235] via-transparent to-transparent" />
                  
                  {/* Badge de Categoría Simulado */}
                  <div className="absolute top-4 left-4">
                     <span className="px-3 py-1 bg-[#0B0F19]/80 backdrop-blur-md rounded-full text-[10px] font-bold text-[#00F0FF] border border-[#00F0FF]/30 uppercase tracking-widest">
                       Confirmed
                     </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-2xl mb-2 text-[#F8FAFC] font-bold group-hover:text-[#FF2A5F] transition-colors line-clamp-1">
                    {event.name}
                  </h3>
                  <div className="flex items-center text-[#94A3B8] mb-4 space-x-4">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-[#00F0FF]" />
                      <span className="text-xs uppercase font-medium">
                        {new Date(event.date).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Music className="w-4 h-4 mr-2 text-[#FF2A5F]" />
                      <span className="text-xs uppercase font-medium">{event.artists?.length || 0} DJs</span>
                    </div>
                  </div>
                  
                  <p className="text-[#94A3B8] text-sm line-clamp-2 min-h-[40px] leading-relaxed">
                    {event.description}
                  </p>

                  <div className="mt-6 pt-6 border-t border-[#94A3B8]/10 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-[#94A3B8] uppercase font-bold tracking-tighter">Tickets desde</span>
                      <span className="text-xl text-[#FF2A5F] font-black">
                        {event.ticketPrices && event.ticketPrices.length > 0 
                          ? `€${Math.min(...event.ticketPrices.map((t) => t.price))}`
                          : 'TBA'}
                      </span>
                    </div>
                    <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF2A5F] to-[#00F0FF] opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-xs font-bold uppercase">
                      Ver Info
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Sin resultados */}
        {filteredEvents.length === 0 && (
          <div className="text-center py-32">
            <div className="w-24 h-24 bg-[#1A2235] rounded-full flex items-center justify-center mx-auto mb-6 border border-[#FF2A5F]/30">
              <Search className="w-10 h-10 text-[#94A3B8]/20" />
            </div>
            <h2 className="text-2xl text-[#F8FAFC] font-bold">No se encontraron eventos</h2>
            <p className="text-[#94A3B8] mt-2">Prueba a cambiar los filtros de búsqueda o fecha.</p>
          </div>
        )}
      </div>
    </div>
  );
};