import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Event, VendorSpace } from '../data/mockData';
import { eventService } from '../services/eventService'; 
import { vendorService } from '../services/vendorService'; 
import { Calendar, MapPin, Users, Music, ChevronLeft, ShoppingCart, Loader2, Store } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [eventSpaces, setEventSpaces] = useState<VendorSpace[]>([]); 
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const [allEvents, allSpaces] = await Promise.all([
          eventService.getAll(),
          vendorService.getAll()
        ]);

        // Solución al error: Tipamos 'ev' como 'Event'
        const foundEvent = allEvents.find((ev: Event) => ev.id === id);
        setEvent(foundEvent || null);

        if (foundEvent) {
          // Tipamos 'space' como 'VendorSpace'
          const filteredSpaces = allSpaces.filter((space: VendorSpace) => space.eventId === foundEvent.id);
          setEventSpaces(filteredSpaces);
        }
      } catch (error) {
        toast.error('Error al cargar la información');
      } finally {
        setLoading(false);
      }
    };
    fetchEventData();
  }, [id]);

  const handleBuyTicket = () => {
    if (!user) {
      toast.error('Debes iniciar sesión para comprar entradas');
      navigate('/login');
      return;
    }

    if (!selectedTicket || !event) {
      toast.error('Selecciona un tipo de entrada');
      return;
    }

    // Solución al error: Tipamos 't' con la interfaz de tickets de tu objeto Event
    const ticket = event.ticketPrices.find((t: any) => t.id === selectedTicket);
    
    if (ticket) {
      addToCart({
        id: `${event.id}-${ticket.id}`,
        name: `${event.name} - ${ticket.type}`,
        price: ticket.price,
        quantity: 1,
        type: 'ticket',
        image: event.image,
        eventId: event.id,
      });
      toast.success('Entrada añadida al carrito');
      navigate('/cart');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#FF2A5F] animate-spin mb-4" />
        <p className="text-[#94A3B8]">Sincronizando coordenadas del festival...</p>
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className="min-h-screen bg-[#0B0F19]">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <button onClick={() => navigate('/menu')} className="flex items-center space-x-2 text-[#94A3B8] hover:text-[#FF2A5F] transition-colors">
          <ChevronLeft className="w-5 h-5" />
          <span>Volver al Panel</span>
        </button>
      </div>

      {/* Hero Section */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative h-[500px] overflow-hidden">
        <img src={event.image} alt={event.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-4 pb-12">
          <h1 className="text-5xl md:text-6xl font-black mb-4 bg-gradient-to-r from-[#FF2A5F] to-[#00F0FF] bg-clip-text text-transparent uppercase tracking-tighter">
            {event.name}
          </h1>
          <div className="flex items-center space-x-6 text-[#F8FAFC] font-bold uppercase tracking-widest text-sm">
            <div className="flex items-center"><Calendar className="w-5 h-5 mr-2 text-[#FF2A5F]" /> {event.date}</div>
            <div className="flex items-center"><Users className="w-5 h-5 mr-2 text-[#00F0FF]" /> {event.artists.length} Artistas</div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            <section>
              <h2 className="text-2xl font-black text-[#F8FAFC] uppercase mb-4 italic">The Experience</h2>
              <p className="text-[#94A3B8] leading-relaxed text-lg">{event.description}</p>
            </section>

            {/* Line-up */}
            <section>
              <h2 className="text-2xl font-black text-[#F8FAFC] uppercase mb-6 italic">Main Line-up</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {event.artists.map((artist) => (
                  <div key={artist.id} className="bg-[#1A2235] border border-[#FF2A5F]/20 p-4 rounded-2xl flex items-center space-x-4 group hover:border-[#FF2A5F]/60 transition-all">
                    <img src={artist.image} className="w-16 h-16 rounded-full object-cover grayscale group-hover:grayscale-0 transition-all" alt={artist.name} />
                    <div>
                      <h3 className="text-[#F8FAFC] font-bold uppercase">{artist.name}</h3>
                      <p className="text-xs text-[#FF2A5F] font-bold tracking-widest">{artist.genre}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* SECCIÓN COHERENTE: Stands asociados al evento */}
            <section className="bg-[#1A2235]/50 p-8 rounded-3xl border border-[#00F0FF]/10">
              <h2 className="text-2xl font-black text-[#F8FAFC] uppercase mb-6 italic flex items-center">
                <Store className="mr-3 text-[#00F0FF]" /> Market & Food Court
              </h2>
              {eventSpaces.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {eventSpaces.map((space) => (
                    <div key={space.id} className="bg-[#0B0F19] p-4 rounded-xl border border-white/5 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${space.type === 'food' ? 'bg-orange-500/10 text-orange-500' : 'bg-blue-500/10 text-blue-500'}`}>
                          <Store className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[#F8FAFC] font-bold text-sm">{space.name}</p>
                          <p className="text-[#94A3B8] text-[10px] uppercase font-bold tracking-wider">{space.location}</p>
                        </div>
                      </div>
                      <span className="text-[10px] bg-[#00F0FF]/10 text-[#00F0FF] px-2 py-1 rounded-full font-black uppercase">
                        {space.type}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[#94A3B8] italic text-sm">Próximamente se anunciarán los establecimientos para este evento.</p>
              )}
            </section>
          </div>

          {/* Sidebar - Tickets */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-[#1A2235] border border-[#FF2A5F]/30 rounded-3xl p-8 shadow-2xl space-y-8">
              <h2 className="text-2xl font-black text-[#F8FAFC] uppercase italic">Get Access</h2>

              <div className="space-y-4">
                {event.ticketPrices.map((ticket) => (
                  <div
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket.id)}
                    className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                      selectedTicket === ticket.id
                        ? 'border-[#FF2A5F] bg-[#FF2A5F]/5 shadow-[0_0_20px_rgba(255,42,95,0.2)]'
                        : 'border-white/5 bg-[#0B0F19] hover:border-[#00F0FF]/40'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg text-[#F8FAFC] font-black uppercase tracking-tighter">{ticket.type}</h3>
                      <span className="text-xl text-[#00F0FF] font-black italic">€{ticket.price}</span>
                    </div>
                    <p className="text-xs text-[#94A3B8] mb-4">{ticket.description}</p>
                    <ul className="space-y-2">
                      {ticket.features.map((f, i) => (
                        <li key={i} className="text-[10px] text-[#F8FAFC] font-bold uppercase flex items-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FF2A5F] mr-2" /> {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <button
                onClick={handleBuyTicket}
                disabled={!selectedTicket}
                className="w-full py-5 rounded-2xl bg-gradient-to-r from-[#FF2A5F] to-[#00F0FF] text-[#F8FAFC] font-black uppercase tracking-widest shadow-[0_0_30px_rgba(255,42,95,0.3)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30 disabled:grayscale"
              >
                Buy Access Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};