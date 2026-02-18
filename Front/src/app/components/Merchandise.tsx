import React, { useState } from 'react';
import { mockMerchandise } from '../data/mockData';
import { ShoppingCart, Filter } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export const Merchandise: React.FC = () => {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const { addToCart } = useCart();

  const categories = ['all', ...new Set(mockMerchandise.map((item) => item.category))];

  const filteredItems =
    categoryFilter === 'all'
      ? mockMerchandise
      : mockMerchandise.filter((item) => item.category === categoryFilter);

  const handleAddToCart = (item: typeof mockMerchandise[0]) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      type: 'merchandise',
      image: item.image,
    });
    toast.success('Producto añadido al carrito');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-950 to-black">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl mb-2 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
            Merchandising Oficial
          </h1>
          <p className="text-xl text-gray-400">Productos exclusivos de Subsonic Festival</p>
        </motion.div>

        {/* Filter */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Filter className="w-5 h-5 text-gray-400" />
            <span className="text-gray-300">Filtrar por categoría:</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setCategoryFilter(category)}
                className={`px-6 py-2 rounded-xl transition-all ${
                  categoryFilter === category
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                    : 'bg-purple-900/30 border border-pink-500/30 text-gray-300 hover:border-pink-500/60'
                }`}
              >
                {category === 'all' ? 'Todo' : category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-pink-500/30 hover:border-pink-500/60 rounded-2xl overflow-hidden transition-all hover:scale-105">
                <div className="relative h-64 overflow-hidden bg-gradient-to-br from-purple-900 to-pink-900">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 rounded-full bg-pink-500/80 text-white text-xs backdrop-blur-sm">
                      {item.category}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl mb-2 text-white group-hover:text-pink-400 transition-colors">
                    {item.name}
                  </h3>
                  
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-2xl text-pink-400">€{item.price}</span>
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white transition-all flex items-center space-x-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>Añadir</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-20">
            <ShoppingCart className="w-24 h-24 mx-auto mb-6 text-gray-600" />
            <h2 className="text-2xl mb-4 text-white">No hay productos en esta categoría</h2>
          </div>
        )}

        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="p-6 rounded-xl bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-pink-500/20">
            <h3 className="text-lg text-white mb-2">Envío Gratis</h3>
            <p className="text-sm text-gray-400">En pedidos superiores a €50</p>
          </div>
          <div className="p-6 rounded-xl bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-pink-500/20">
            <h3 className="text-lg text-white mb-2">Productos Oficiales</h3>
            <p className="text-sm text-gray-400">100% merchandising autorizado</p>
          </div>
          <div className="p-6 rounded-xl bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-pink-500/20">
            <h3 className="text-lg text-white mb-2">Recogida en el Festival</h3>
            <p className="text-sm text-gray-400">Disponible para todos los eventos</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
