import React, { useState } from 'react';
import { User, Store, Mail, Phone, MapPin, Calendar, Award } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export const VendorProfile: React.FC = () => {
  const [formData, setFormData] = useState({
    businessName: 'Food Truck Deluxe',
    serviceType: 'food',
    description: 'Especialistas en comida gourmet para eventos. Más de 10 años de experiencia en festivales de música.',
    email: 'contact@foodtruckdeluxe.com',
    phone: '+34 600 123 456',
    location: 'Barcelona, España',
    image: 'https://images.unsplash.com/photo-1605329540493-6741250d2bee?w=400',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Perfil actualizado correctamente');
  };

  const pastFestivals = [
    { name: 'Subsonic Festival 2025', role: 'Food Court', date: 'Julio 2025', rating: 4.8 },
    { name: 'Primavera Sound 2024', role: 'Food Vendor', date: 'Mayo 2024', rating: 4.9 },
    { name: 'Sónar 2024', role: 'Premium Food', date: 'Junio 2024', rating: 4.7 },
    { name: 'Mad Cool 2023', role: 'Food Truck', date: 'Julio 2023', rating: 4.6 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-950 to-black">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl mb-2 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
            Perfil Público
          </h1>
          <p className="text-xl text-gray-400">Administra tu información de proveedor</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Business Info */}
              <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-pink-500/30 rounded-2xl p-8">
                <h2 className="text-2xl mb-6 text-white">Información del Negocio</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Nombre del Negocio</label>
                    <div className="relative">
                      <Store className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={formData.businessName}
                        onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-purple-900/30 border border-pink-500/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Tipo de Servicio</label>
                    <select
                      value={formData.serviceType}
                      onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-purple-900/30 border border-pink-500/30 text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                    >
                      <option value="food">Comida</option>
                      <option value="beverage">Bebidas</option>
                      <option value="merchandise">Merchandising</option>
                      <option value="services">Servicios</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Descripción</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl bg-purple-900/30 border border-pink-500/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-pink-500/30 rounded-2xl p-8">
                <h2 className="text-2xl mb-6 text-white">Información de Contacto</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-purple-900/30 border border-pink-500/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Teléfono</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-purple-900/30 border border-pink-500/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Ubicación</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-purple-900/30 border border-pink-500/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white transition-all"
              >
                Guardar Cambios
              </button>
            </form>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Preview */}
            <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-pink-500/30 rounded-2xl p-6">
              <h3 className="text-xl mb-4 text-white">Vista Previa</h3>
              <div className="relative h-32 rounded-xl overflow-hidden mb-4">
                <img
                  src={formData.image}
                  alt="Business"
                  className="w-full h-full object-cover"
                />
              </div>
              <h4 className="text-lg text-white mb-1">{formData.businessName}</h4>
              <p className="text-sm text-pink-400 mb-3 capitalize">{formData.serviceType}</p>
              <p className="text-sm text-gray-400 line-clamp-3">{formData.description}</p>
            </div>

            {/* Stats */}
            <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-pink-500/30 rounded-2xl p-6">
              <h3 className="text-xl mb-4 text-white">Estadísticas</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Festivales</span>
                  <span className="text-2xl text-pink-400">{pastFestivals.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Rating Promedio</span>
                  <span className="text-2xl text-pink-400">4.75</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Años Activo</span>
                  <span className="text-2xl text-pink-400">10+</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* History */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-12"
        >
          <h2 className="text-2xl mb-6 text-white">Historial de Festivales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pastFestivals.map((festival, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-pink-500/30 rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-3">
                  <Calendar className="w-5 h-5 text-pink-400" />
                  <div className="flex items-center space-x-1">
                    <Award className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm text-yellow-400">{festival.rating}</span>
                  </div>
                </div>
                <h3 className="text-white mb-1">{festival.name}</h3>
                <p className="text-sm text-gray-400 mb-1">{festival.role}</p>
                <p className="text-xs text-gray-500">{festival.date}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
