import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Event } from '../data/mockData';
import { eventService } from '../services/eventService'; 
import { Calendar, MapPin, Users, Music, ChevronLeft, ShoppingCart, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  
  // --- ESTADOS ---
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);

  // --- CARGA DE DATOS ---
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const allEvents = await eventService.getAll();
        const foundEvent = allEvents.find((e) => e.id === id);
        setEvent(foundEvent || null);
      } catch (error) {
        toast.error('Error al cargar la información del evento');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
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

    const ticket = event.ticketPrices.find((t) => t.id === selectedTicket);
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

  // --- RENDER DE CARGA ---
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#FF2A5F] animate-spin mb-4" />
        <p className="text-[#94A3B8]">Cargando detalles del evento...</p>
      </div>
    );
  }

  // --- RENDER SI NO HAY EVENTO ---
  if (!event) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center">
        <p className="text-[#F8FAFC] text-xl mb-6">Evento no encontrado</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-[#1A2235] text-[#F8FAFC] rounded-xl border border-[#FF2A5F]/50"
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F19]">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 text-[#94A3B8] hover:text-[#FF2A5F] transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Volver a eventos</span>
        </button>
      </div>

      {/* Hero Image */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative h-[500px] overflow-hidden"
      >
        <img
          src={event.image}
          alt={event.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/50 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-4 pb-12">
          <motion.h1
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-5xl md:text-6xl mb-4 bg-gradient-to-r from-[#FF2A5F] to-[#00F0FF] bg-clip-text text-transparent"
          >
            {event.name}
          </motion.h1>
          <div className="flex items-center space-x-4 text-[#94A3B8]">
            <div className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              <span>
                {new Date(event.date).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
            <div className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              <span>{event.artists.length} artistas</span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h2 className="text-2xl mb-4 text-[#F8FAFC]">Sobre el Evento</h2>
              <p className="text-[#94A3B8] leading-relaxed">{event.description}</p>
            </section>

            {/* Line-up */}
            <section>
              <h2 className="text-2xl mb-6 text-[#F8FAFC]">Line-up</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {event.artists.map((artist) => (
                  <div
                    key={artist.id}
                    className="relative rounded-xl overflow-hidden bg-[#1A2235] border border-[#FF2A5F]/30 p-4 hover:border-[#FF2A5F]/60 transition-all group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF2A5F] to-[#00F0FF] flex items-center justify-center">
                        <Music className="w-6 h-6 text-[#F8FAFC]" />
                      </div>
                      <div>
                        <h3 className="text-[#F8FAFC] group-hover:text-[#FF2A5F] transition-colors font-bold">
                          {artist.name}
                        </h3>
                        <p className="text-sm text-[#94A3B8]">{artist.genre}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Services */}
            <section>
              <h2 className="text-2xl mb-6 text-[#F8FAFC]">Servicios Incluidos</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {event.services.map((service, index) => (
                  <div
                    key={index}
                    className="px-4 py-3 rounded-lg bg-[#1A2235] border border-[#FF2A5F]/30 text-[#94A3B8] text-center text-sm"
                  >
                    {service}
                  </div>
                ))}
              </div>
            </section>

            {/* Map */}
            <section>
              <h2 className="text-2xl mb-6 text-[#F8FAFC]">Mapa del Festival</h2>
              <div className="relative h-96 rounded-xl overflow-hidden border border-[#FF2A5F]/20">
                <img
                  src={event.mapImage || 'https://images.unsplash.com/photo-1516037172336-512c4aa6b16a?w=1200'}
                  alt="Festival Map"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19]/60 to-transparent flex items-center justify-center">
                  <div className="flex items-center space-x-2 text-[#F8FAFC] bg-[#0B0F19]/80 px-4 py-2 rounded-full backdrop-blur-sm">
                    <MapPin className="w-6 h-6 text-[#FF2A5F]" />
                    <span className="text-lg font-bold">Recinto Festival Subsonic</span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar - Tickets */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-[#1A2235] border border-[#FF2A5F]/30 rounded-2xl p-6 shadow-2xl">
              <h2 className="text-2xl mb-6 text-[#F8FAFC]">Entradas</h2>

              <div className="space-y-4 mb-6">
                {event.ticketPrices.length > 0 ? (
                  event.ticketPrices.map((ticket) => (
                    <div
                      key={ticket.id}
                      onClick={() => setSelectedTicket(ticket.id)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedTicket === ticket.id
                          ? 'border-[#FF2A5F] bg-[#FF2A5F]/10'
                          : 'border-[#00F0FF]/30 bg-[#0B0F19]/50 hover:border-[#00F0FF]/60'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg text-[#F8FAFC] font-bold">{ticket.type}</h3>
                        <span className="text-xl text-[#FF2A5F] font-bold">€{ticket.price}</span>
                      </div>
                      <p className="text-sm text-[#94A3B8] mb-3">{ticket.description}</p>
                      <ul className="space-y-1">
                        {ticket.features.map((feature, index) => (
                          <li key={index} className="text-xs text-[#94A3B8] flex items-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#FF2A5F] mr-2" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))
                ) : (
                  <p className="text-[#94A3B8] text-sm italic">Entradas próximamente...</p>
                )}
              </div>

              <button
                onClick={handleBuyTicket}
                disabled={!selectedTicket}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-[#FF2A5F] to-[#00F0FF] hover:from-[#E62555] hover:to-[#00D8E6] text-[#F8FAFC] font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Añadir al carrito</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};