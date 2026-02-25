import React, { useState } from 'react';
import { mockVendorSpaces } from '../../data/mockData';
import { Search, MapPin, DollarSign, Ruler, Filter } from 'lucide-react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';

export const SpacesSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sizeFilter, setSizeFilter] = useState('all');
  const [maxPrice, setMaxPrice] = useState(10000);
  const navigate = useNavigate();

  const types = ['all', ...new Set(mockVendorSpaces.map((s) => s.type))];
  const sizes = ['all', ...new Set(mockVendorSpaces.map((s) => s.size))];

  const filteredSpaces = mockVendorSpaces.filter((space) => {
    const matchesSearch = space.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || space.type === typeFilter;
    const matchesSize = sizeFilter === 'all' || space.size === sizeFilter;
    const matchesPrice = space.price <= maxPrice;
    return matchesSearch && matchesType && matchesSize && matchesPrice;
  });

  return (
    <div className="min-h-screen bg-[#0B0F19]">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl mb-2 bg-gradient-to-r from-[#FF2A5F] to-[#00F0FF] bg-clip-text text-transparent">
            Buscar Espacios
          </h1>
          <p className="text-xl text-[#94A3B8]">Encuentra el espacio perfecto para tu negocio</p>
        </motion.div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#94A3B8] w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar espacios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#1A2235] border border-[#FF2A5F]/30 text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#FF2A5F]/50"
            />
          </div>

          {/* Filters */}
          <div className="bg-[#1A2235] border border-[#FF2A5F]/30 rounded-2xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Filter className="w-5 h-5 text-[#FF2A5F]" />
              <h3 className="text-lg text-[#F8FAFC]">Filtros</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Type Filter */}
              <div>
                <label className="block text-sm text-[#94A3B8] mb-2">Tipo</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-[#0B0F19]/50 border border-[#FF2A5F]/30 text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#FF2A5F]/50"
                >
                  {types.map((type) => (
                    <option key={type} value={type}>
                      {type === 'all' ? 'Todos' : type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Size Filter */}
              <div>
                <label className="block text-sm text-[#94A3B8] mb-2">Tamaño</label>
                <select
                  value={sizeFilter}
                  onChange={(e) => setSizeFilter(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-[#0B0F19]/50 border border-[#FF2A5F]/30 text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#FF2A5F]/50"
                >
                  {sizes.map((size) => (
                    <option key={size} value={size}>
                      {size === 'all' ? 'Todos' : size}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Filter */}
              <div>
                <label className="block text-sm text-[#94A3B8] mb-2">
                  Precio máximo: €{maxPrice}
                </label>
                <input
                  type="range"
                  min="0"
                  max="10000"
                  step="500"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mb-6 text-[#94A3B8]">
          {filteredSpaces.length} espacio{filteredSpaces.length !== 1 ? 's' : ''} encontrado
          {filteredSpaces.length !== 1 ? 's' : ''}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSpaces.map((space, index) => (
            <motion.div
              key={space.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => navigate(`/vendor/space/${space.id}`)}
              className="group cursor-pointer"
            >
              <div className="bg-[#1A2235] border border-[#FF2A5F]/30 hover:border-[#FF2A5F]/60 rounded-2xl overflow-hidden transition-all hover:scale-105">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={space.image}
                    alt={space.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/50 to-transparent" />
                  <div className="absolute top-4 right-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs backdrop-blur-sm ${
                        space.available
                          ? 'bg-green-500/80 text-[#F8FAFC]'
                          : 'bg-red-500/80 text-[#F8FAFC]'
                      }`}
                    >
                      {space.available ? 'Disponible' : 'Reservado'}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl mb-2 text-[#F8FAFC] group-hover:text-[#FF2A5F] transition-colors">
                    {space.name}
                  </h3>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-[#94A3B8] text-sm">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{space.location}</span>
                    </div>
                    <div className="flex items-center text-[#94A3B8] text-sm">
                      <Ruler className="w-4 h-4 mr-2" />
                      <span>{space.dimensions} - {space.size}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-2xl text-[#FF2A5F]">€{space.price}</span>
                    <span className="text-xs text-[#94A3B8]/60 capitalize">{space.type}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredSpaces.length === 0 && (
          <div className="text-center py-20">
            <Search className="w-24 h-24 mx-auto mb-6 text-[#94A3B8]/60" />
            <h2 className="text-2xl mb-4 text-[#F8FAFC]">No se encontraron espacios</h2>
            <p className="text-[#94A3B8]">Intenta ajustar los filtros</p>
          </div>
        )}
      </div>
    </div>
  );
};
