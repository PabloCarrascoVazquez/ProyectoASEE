import React, { useState } from 'react';
import { mockEvents } from '../data/mockData';
import { Search, Calendar, Music } from 'lucide-react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';

export const Home: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const navigate = useNavigate();

  const filteredEvents = mockEvents.filter((event) => {
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = !dateFilter || event.date === dateFilter;
    return matchesSearch && matchesDate;
  });

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
            src="https://images.unsplash.com/photo-1624929303661-22c5bce0169b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJvbmljJTIwbXVzaWMlMjBmZXN0aXZhbCUyMHN0YWdlJTIwbGlnaHRzfGVufDF8fHx8MTc3MTQxMzA5M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Festival"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B0F19]/80 via-[#1A2235]/50 to-[#0B0F19]" />
        </div>

        <div className="relative z-10 text-center px-4">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <Music className="w-20 h-20 mx-auto mb-6 text-[#FF2A5F]" />
            <h1 className="text-6xl md:text-8xl mb-4 bg-gradient-to-r from-[#FF2A5F] to-[#00F0FF] bg-clip-text text-transparent">
              SUBSONIC
            </h1>
            <p className="text-2xl md:text-3xl text-[#94A3B8] mb-8">
              FESTIVAL 2026
            </p>
            <p className="text-xl text-[#94A3B8] max-w-2xl mx-auto">
              La experiencia de música electrónica más espectacular del año
            </p>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0B0F19] to-transparent" />
      </motion.div>

      {/* Search and Filter Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-4 mb-12">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#94A3B8] w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar eventos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#1A2235] border border-[#FF2A5F]/30 text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#FF2A5F]/50"
            />
          </div>

          <div className="relative md:w-64">
            <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#94A3B8] w-5 h-5" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#1A2235] border border-[#FF2A5F]/30 text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#FF2A5F]/50"
            />
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => navigate(`/event/${event.id}`)}
              className="group cursor-pointer"
            >
              <div className="relative rounded-2xl overflow-hidden bg-[#1A2235] border border-[#FF2A5F]/30 hover:border-[#FF2A5F]/60 transition-all duration-300 hover:scale-105">
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/50 to-transparent" />
                </div>

                <div className="p-6">
                  <h3 className="text-xl mb-2 text-[#F8FAFC] group-hover:text-[#FF2A5F] transition-colors">
                    {event.name}
                  </h3>
                  <div className="flex items-center text-[#94A3B8] mb-4">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span className="text-sm">
                      {new Date(event.date).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <p className="text-[#94A3B8] text-sm line-clamp-2">{event.description}</p>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-[#FF2A5F]">
                      Desde €{Math.min(...event.ticketPrices.map((t) => t.price))}
                    </span>
                    <span className="text-sm text-[#94A3B8]">
                      {event.artists.length} artistas
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-20">
            <Music className="w-16 h-16 mx-auto mb-4 text-[#94A3B8]/60" />
            <p className="text-xl text-[#94A3B8]">No se encontraron eventos</p>
          </div>
        )}
      </div>
    </div>
  );
};
