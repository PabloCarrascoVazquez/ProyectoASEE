import React from 'react';
import { useParams, useNavigate } from 'react-router';
import { mockVendorSpaces } from '../../data/mockData';
import { ChevronLeft, MapPin, Ruler, CheckCircle, Send } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export const SpaceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const space = mockVendorSpaces.find((s) => s.id === id);

  if (!space) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center">
        <p className="text-[#F8FAFC] text-xl">Espacio no encontrado</p>
      </div>
    );
  }

  const handleRequest = () => {
    toast.success('Solicitud enviada correctamente');
    setTimeout(() => {
      navigate('/vendor/menu');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#0B0F19]">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Back Button */}
        <button
          onClick={() => navigate('/vendor/spaces')}
          className="flex items-center space-x-2 text-[#94A3B8] hover:text-[#FF2A5F] transition-colors mb-6"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Volver a espacios</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative h-96 rounded-2xl overflow-hidden"
            >
              <img
                src={space.image}
                alt={space.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/50 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <h1 className="text-4xl mb-2 text-[#F8FAFC]">{space.name}</h1>
                <div className="flex items-center space-x-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      space.available
                        ? 'bg-green-500/80 text-[#F8FAFC]'
                        : 'bg-red-500/80 text-[#F8FAFC]'
                    }`}
                  >
                    {space.available ? 'Disponible' : 'Reservado'}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-[#00F0FF]/80 text-[#0B0F19] text-sm capitalize">
                    {space.type}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Details */}
            <div className="bg-[#1A2235] border border-[#FF2A5F]/30 rounded-2xl p-8">
              <h2 className="text-2xl mb-6 text-[#F8FAFC]">Detalles del Espacio</h2>

              <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                  <div className="flex items-center text-[#94A3B8] mb-2">
                    <MapPin className="w-5 h-5 mr-2" />
                    <span className="text-sm">Ubicación</span>
                  </div>
                  <p className="text-[#F8FAFC] text-lg">{space.location}</p>
                </div>

                <div>
                  <div className="flex items-center text-[#94A3B8] mb-2">
                    <Ruler className="w-5 h-5 mr-2" />
                    <span className="text-sm">Dimensiones</span>
                  </div>
                  <p className="text-[#F8FAFC] text-lg">{space.dimensions}</p>
                </div>

                <div>
                  <p className="text-[#94A3B8] text-sm mb-2">Tamaño</p>
                  <p className="text-[#F8FAFC] text-lg">{space.size}</p>
                </div>

                <div>
                  <p className="text-[#94A3B8] text-sm mb-2">Tipo</p>
                  <p className="text-[#F8FAFC] text-lg capitalize">{space.type}</p>
                </div>
              </div>

              <div>
                <h3 className="text-xl mb-4 text-[#F8FAFC]">Servicios Incluidos</h3>
                <div className="grid grid-cols-2 gap-3">
                  {space.services.map((service, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 p-3 rounded-lg bg-[#0B0F19]/50 border border-[#00F0FF]/30"
                    >
                      <CheckCircle className="w-5 h-5 text-[#00F0FF]" />
                      <span className="text-[#94A3B8]">{service}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-[#1A2235] border border-[#FF2A5F]/30 rounded-2xl p-8">
              <h2 className="text-2xl mb-4 text-[#F8FAFC]">Información Adicional</h2>
              <div className="space-y-3 text-[#94A3B8]">
                <p>• El precio incluye todo el periodo del festival (3 días)</p>
                <p>• Montaje permitido desde 2 días antes del evento</p>
                <p>• Desmontaje hasta 1 día después del evento</p>
                <p>• Depósito del 50% requerido para confirmar la reserva</p>
                <p>• Seguro de responsabilidad civil incluido</p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-[#1A2235] border border-[#FF2A5F]/30 rounded-2xl p-6">
              <div className="mb-6">
                <p className="text-[#94A3B8] text-sm mb-2">Precio</p>
                <p className="text-4xl text-[#FF2A5F]">€{space.price}</p>
                <p className="text-[#94A3B8]/60 text-sm mt-1">por evento</p>
              </div>

              <div className="mb-6 p-4 rounded-xl bg-[#0B0F19]/50 border border-[#00F0FF]/30">
                <h3 className="text-[#F8FAFC] mb-2">¿Qué incluye?</h3>
                <ul className="space-y-1 text-sm text-[#94A3B8]">
                  <li>• Alquiler del espacio</li>
                  <li>• Servicios básicos</li>
                  <li>• Seguridad 24/7</li>
                  <li>• Limpieza diaria</li>
                </ul>
              </div>

              {space.available ? (
                <button
                  onClick={handleRequest}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-[#FF2A5F] to-[#00F0FF] hover:from-[#E62555] hover:to-[#00D8E6] text-[#F8FAFC] transition-all flex items-center justify-center space-x-2"
                >
                  <Send className="w-5 h-5" />
                  <span>Solicitar Alquiler</span>
                </button>
              ) : (
                <button
                  disabled
                  className="w-full py-4 rounded-xl bg-gray-700 text-[#94A3B8]/60 cursor-not-allowed"
                >
                  No Disponible
                </button>
              )}

              <div className="mt-6 p-4 rounded-xl bg-[#00F0FF]/10 border border-[#00F0FF]/30">
                <p className="text-xs text-[#94A3B8] text-center">
                  ¿Tienes preguntas? Contacta con nuestro equipo de soporte
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
