import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { VendorSpace, Event } from '../../data/mockData';
import { vendorService } from '../../services/vendorService';
import { eventService } from '../../services/eventService';
import { ChevronLeft, MapPin, CheckCircle, Send, Calendar, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export const SpaceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [space, setSpace] = useState<VendorSpace | null>(null);
  const [associatedEvent, setAssociatedEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      try {
        const [allSpaces, allEvents] = await Promise.all([
          vendorService.getAll(),
          eventService.getAll()
        ]);
        
        // Buscamos el espacio asegurando que el ID sea string
        const foundSpace = allSpaces.find(s => String(s.id) === String(id));
        
        if (foundSpace) {
          setSpace(foundSpace);
          // BUSQUEDA CRÍTICA: Forzamos a string ambos IDs para que "1" === 1
          const event = allEvents.find(e => String(e.id) === String(foundSpace.eventId));
          setAssociatedEvent(event || null);
          
          if (!event) console.warn("CUIDADO: No se encontró evento para el ID:", foundSpace.eventId);
        }
      } catch (error) {
        toast.error('Error de red');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handleRequest = () => {
    toast.success('Solicitud enviada al equipo de logística Subsonic');
    setTimeout(() => navigate('/vendor/menu'), 1500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#FF2A5F] animate-spin mb-4" />
        <p className="text-[#94A3B8] font-black uppercase tracking-widest">Cargando Especificaciones...</p>
      </div>
    );
  }

  if (!space) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center">
        <p className="text-white text-xl uppercase font-black">Espacio no identificado</p>
        <button onClick={() => navigate('/vendor/spaces')} className="mt-4 text-[#00F0FF] underline">Volver al buscador</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] p-8">
      <div className="max-w-7xl mx-auto py-12">
        <button
          onClick={() => navigate('/vendor/spaces')}
          className="flex items-center space-x-2 text-gray-500 hover:text-[#FF2A5F] transition-all mb-8 uppercase font-black text-xs tracking-widest"
        >
          <ChevronLeft className="w-4 h-4" /> <span>Back to Search</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-[#00F0FF]/5 border border-[#00F0FF]/20 p-6 rounded-3xl flex items-center space-x-6">
                <div className="p-4 bg-[#00F0FF]/10 rounded-2xl">
                    <Calendar className="w-8 h-8 text-[#00F0FF]" />
                </div>
                <div>
                    <h4 className="text-[10px] font-black text-[#00F0FF] uppercase tracking-[0.3em]">Associated Event</h4>
                    <p className="text-2xl font-black text-white uppercase italic">{associatedEvent?.name}</p>
                    <p className="text-gray-400 font-bold">{associatedEvent?.date}</p>
                </div>
            </div>

            <div className="relative h-96 rounded-[2rem] overflow-hidden border border-white/5">
              <img src={space.image} className="w-full h-full object-cover" alt={space.name} />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] to-transparent" />
              <div className="absolute bottom-8 left-8">
                <h1 className="text-5xl font-black text-white uppercase italic tracking-tighter">{space.name}</h1>
                <p className="text-[#FF2A5F] font-black uppercase tracking-widest mt-2">{space.type} Division</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#1A2235] p-8 rounded-3xl border border-white/5">
                    <h3 className="text-white font-black uppercase text-sm mb-6 flex items-center">
                        <MapPin className="mr-2 text-[#FF2A5F]" /> Technical Specs
                    </h3>
                    <div className="space-y-4">
                        <div className="flex justify-between border-b border-white/5 pb-2">
                            <span className="text-gray-500 font-bold text-xs uppercase">Dimensions</span>
                            <span className="text-white font-black">{space.dimensions}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-2">
                            <span className="text-gray-500 font-bold text-xs uppercase">Classification</span>
                            <span className="text-white font-black">{space.size}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-2">
                            <span className="text-gray-500 font-bold text-xs uppercase">Zone</span>
                            <span className="text-white font-black">{space.location}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-[#1A2235] p-8 rounded-3xl border border-white/5">
                    <h3 className="text-white font-black uppercase text-sm mb-6 flex items-center">
                        <CheckCircle className="mr-2 text-[#00F0FF]" /> Facilities
                    </h3>
                    <div className="grid grid-cols-1 gap-2">
                        {space.services.map((s, i) => (
                            <div key={i} className="flex items-center text-xs font-bold text-gray-400 bg-white/5 p-2 rounded-lg">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#00F0FF] mr-3" /> {s}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-[#1A2235] p-8 rounded-[2.5rem] border border-[#FF2A5F]/30 shadow-2xl space-y-8">
              <div>
                <p className="text-gray-500 font-black uppercase text-[10px] tracking-widest mb-1">Rental Investment</p>
                <p className="text-5xl font-black text-[#FF2A5F] italic">€{space.price}</p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleRequest}
                  disabled={!space.available}
                  className="w-full py-5 rounded-2xl bg-gradient-to-r from-[#FF2A5F] to-[#00F0FF] text-white font-black uppercase tracking-widest shadow-lg hover:scale-[1.02] transition-all disabled:grayscale disabled:opacity-50"
                >
                  {space.available ? 'Request Lease' : 'Space Occupied'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};