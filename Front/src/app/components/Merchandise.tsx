import React, { useState, useEffect } from 'react';
import { MerchandiseItem } from '../data/mockData';
import { merchService } from '../services/merchService'; // Importamos el objeto completo del servicio
import { ShoppingCart, Filter, Loader2 } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export const Merchandise: React.FC = () => {
  const [items, setItems] = useState<MerchandiseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const { addToCart } = useCart();

  // --- CARGA DE DATOS ---
  useEffect(() => {
    const loadData = async () => {
      try {
        // Usamos el getAll del servicio (que lee de localStorage o mock)
        const data = await merchService.getAll();
        setItems(data);
      } catch (error) {
        toast.error('No se pudieron cargar los productos');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // --- LÓGICA DE FILTRADO ---
  const categories = ['all', ...new Set(items.map((item) => item.category))];

  const filteredItems =
    categoryFilter === 'all'
      ? items
      : items.filter((item) => item.category === categoryFilter);

  const handleAddToCart = (item: MerchandiseItem) => {
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

  // --- ESTADO DE CARGA ---
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#FF2A5F] animate-spin mb-4" />
        <p className="text-[#94A3B8] animate-pulse">Abriendo tienda...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F19]">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Cabecera */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl mb-2 bg-gradient-to-r from-[#FF2A5F] to-[#00F0FF] bg-clip-text text-transparent">
            Merchandising Oficial
          </h1>
          <p className="text-xl text-[#94A3B8]">Productos exclusivos de Subsonic Festival</p>
        </motion.div>

        {/* Filtros */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Filter className="w-5 h-5 text-[#94A3B8]" />
            <span className="text-[#94A3B8]">Filtrar por categoría:</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setCategoryFilter(category)}
                className={`px-6 py-2 rounded-xl transition-all ${
                  categoryFilter === category
                    ? 'bg-gradient-to-r from-[#FF2A5F] to-[#00F0FF] text-[#F8FAFC]'
                    : 'bg-[#1A2235] border border-[#FF2A5F]/30 text-[#94A3B8] hover:border-[#FF2A5F]/60'
                }`}
              >
                {category === 'all' ? 'Todo' : category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Grid de Productos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-[#1A2235] border border-[#FF2A5F]/30 hover:border-[#FF2A5F]/60 rounded-2xl overflow-hidden transition-all hover:scale-105 h-full flex flex-col">
                <div className="relative h-64 overflow-hidden bg-[#0B0F19]">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19]/60 to-transparent" />
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 rounded-full bg-[#FF2A5F]/80 text-[#F8FAFC] text-xs backdrop-blur-sm uppercase font-bold">
                      {item.category}
                    </span>
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-1 justify-between">
                  <h3 className="text-xl mb-2 text-[#F8FAFC] group-hover:text-[#FF2A5F] transition-colors">
                    {item.name}
                  </h3>
                  
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-2xl text-[#FF2A5F]">€{item.price}</span>
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#FF2A5F] to-[#00F0FF] hover:from-[#E62555] hover:to-[#00D8E6] text-[#F8FAFC] transition-all flex items-center space-x-2"
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

        {/* Estado Vacío */}
        {filteredItems.length === 0 && (
          <div className="text-center py-20">
            <ShoppingCart className="w-24 h-24 mx-auto mb-6 text-[#94A3B8]/60" />
            <h2 className="text-2xl mb-4 text-[#F8FAFC]">No hay productos disponibles</h2>
          </div>
        )}
      </div>
    </div>
  );
};