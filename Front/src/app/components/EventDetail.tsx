import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { mockEvents } from '../data/mockData';
import { Calendar, MapPin, Users, Music, ChevronLeft, ShoppingCart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);

  const event = mockEvents.find((e) => e.id === id);

  if (!event) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white text-xl">Evento no encontrado</p>
      </div>
    );
  }

  const handleBuyTicket = () => {
    if (!user) {
      toast.error('Debes iniciar sesión para comprar entradas');
      navigate('/login');
      return;
    }

    if (!selectedTicket) {
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-950 to-black">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 text-gray-400 hover:text-pink-400 transition-colors"
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
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-4 pb-12">
          <motion.h1
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-5xl md:text-6xl mb-4 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent"
          >
            {event.name}
          </motion.h1>
          <div className="flex items-center space-x-4 text-gray-300">
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
            {/* Description */}
            <section>
              <h2 className="text-2xl mb-4 text-white">Sobre el Evento</h2>
              <p className="text-gray-300 leading-relaxed">{event.description}</p>
            </section>

            {/* Artists */}
            <section>
              <h2 className="text-2xl mb-6 text-white">Line-up</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {event.artists.map((artist) => (
                  <div
                    key={artist.id}
                    className="relative rounded-xl overflow-hidden bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-pink-500/30 p-4 hover:border-pink-500/60 transition-all group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
                        <Music className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white group-hover:text-pink-400 transition-colors">
                          {artist.name}
                        </h3>
                        <p className="text-sm text-gray-400">{artist.genre}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Services */}
            <section>
              <h2 className="text-2xl mb-6 text-white">Servicios Incluidos</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {event.services.map((service, index) => (
                  <div
                    key={index}
                    className="px-4 py-3 rounded-lg bg-purple-900/30 border border-pink-500/30 text-gray-300 text-center"
                  >
                    {service}
                  </div>
                ))}
              </div>
            </section>

            {/* Gallery */}
            {event.gallery.length > 0 && (
              <section>
                <h2 className="text-2xl mb-6 text-white">Galería</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {event.gallery.map((image, index) => (
                    <div key={index} className="relative h-48 rounded-xl overflow-hidden group">
                      <img
                        src={image}
                        alt={`Gallery ${index + 1}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Map */}
            <section>
              <h2 className="text-2xl mb-6 text-white">Mapa del Festival</h2>
              <div className="relative h-96 rounded-xl overflow-hidden">
                <img
                  src={event.mapImage}
                  alt="Festival Map"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-center justify-center">
                  <div className="flex items-center space-x-2 text-white">
                    <MapPin className="w-6 h-6" />
                    <span className="text-lg">Recinto Festival Subsonic</span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar - Tickets */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-pink-500/30 rounded-2xl p-6">
              <h2 className="text-2xl mb-6 text-white">Entradas</h2>

              <div className="space-y-4 mb-6">
                {event.ticketPrices.map((ticket) => (
                  <div
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket.id)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedTicket === ticket.id
                        ? 'border-pink-500 bg-pink-500/10'
                        : 'border-purple-500/30 bg-purple-900/20 hover:border-purple-500/60'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg text-white">{ticket.type}</h3>
                      <span className="text-xl text-pink-400">€{ticket.price}</span>
                    </div>
                    <p className="text-sm text-gray-400 mb-3">{ticket.description}</p>
                    <ul className="space-y-1">
                      {ticket.features.map((feature, index) => (
                        <li key={index} className="text-xs text-gray-300 flex items-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-pink-400 mr-2" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <button
                onClick={handleBuyTicket}
                disabled={!selectedTicket}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
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
