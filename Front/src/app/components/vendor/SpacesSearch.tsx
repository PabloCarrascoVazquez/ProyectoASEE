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
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-950 to-black">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl mb-2 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
            Buscar Espacios
          </h1>
          <p className="text-xl text-gray-400">Encuentra el espacio perfecto para tu negocio</p>
        </motion.div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar espacios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-purple-900/30 border border-pink-500/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
            />
          </div>

          {/* Filters */}
          <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-pink-500/30 rounded-2xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Filter className="w-5 h-5 text-pink-400" />
              <h3 className="text-lg text-white">Filtros</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Type Filter */}
              <div>
                <label className="block text-sm text-gray-300 mb-2">Tipo</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-purple-900/30 border border-pink-500/30 text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50"
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
                <label className="block text-sm text-gray-300 mb-2">Tamaño</label>
                <select
                  value={sizeFilter}
                  onChange={(e) => setSizeFilter(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-purple-900/30 border border-pink-500/30 text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50"
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
                <label className="block text-sm text-gray-300 mb-2">
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
        <div className="mb-6 text-gray-300">
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
              <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-pink-500/30 hover:border-pink-500/60 rounded-2xl overflow-hidden transition-all hover:scale-105">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={space.image}
                    alt={space.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                  <div className="absolute top-4 right-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs backdrop-blur-sm ${
                        space.available
                          ? 'bg-green-500/80 text-white'
                          : 'bg-red-500/80 text-white'
                      }`}
                    >
                      {space.available ? 'Disponible' : 'Ocupado'}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl mb-2 text-white group-hover:text-pink-400 transition-colors">
                    {space.name}
                  </h3>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-400 text-sm">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{space.location}</span>
                    </div>
                    <div className="flex items-center text-gray-400 text-sm">
                      <Ruler className="w-4 h-4 mr-2" />
                      <span>{space.dimensions} - {space.size}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-2xl text-pink-400">€{space.price}</span>
                    <span className="text-xs text-gray-500 capitalize">{space.type}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredSpaces.length === 0 && (
          <div className="text-center py-20">
            <Search className="w-24 h-24 mx-auto mb-6 text-gray-600" />
            <h2 className="text-2xl mb-4 text-white">No se encontraron espacios</h2>
            <p className="text-gray-400">Intenta ajustar los filtros</p>
          </div>
        )}
      </div>
    </div>
  );
};
