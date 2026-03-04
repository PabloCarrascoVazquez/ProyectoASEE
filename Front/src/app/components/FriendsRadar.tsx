import React, { useState, useEffect } from 'react';
import { Friend } from '../data/mockData';
import { friendService } from '../services/friendsService';
import { Users, MapPin, Navigation, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export const FriendsRadar: React.FC = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);

  // --- CARGA INICIAL Y SIMULACIÓN DE TIEMPO REAL ---
  useEffect(() => {
    // 1. Carga inicial
    friendService.getFriends().then(data => {
      setFriends(data);
      setLoading(false);
    });

    // 2. Simular actualizaciones en "tiempo real" cada 5 segundos
    const interval = setInterval(() => {
      setFriends(currentFriends => friendService.simulateMovement(currentFriends));
    }, 5000);

    return () => clearInterval(interval); // Limpiar al desmontar
  }, []);

  const selectedFriend = friends.find((f) => f.id === selectedFriendId);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#00F0FF] animate-spin mb-4" />
        <p className="text-[#94A3B8]">Sincronizando GPS de amigos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F19]">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl mb-2 bg-gradient-to-r from-[#FF2A5F] to-[#00F0FF] bg-clip-text text-transparent uppercase font-black">
            Radar de Amigos
          </h1>
          <p className="text-xl text-[#94A3B8]">Encuentra a tu squad en el festival</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#1A2235] border border-[#FF2A5F]/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl text-[#F8FAFC] font-bold">Mapa del Recinto</h2>
                <div className="flex items-center space-x-2 text-[#00F0FF]">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00F0FF] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00F0FF]"></span>
                  </span>
                  <span className="text-xs font-bold uppercase tracking-widest">En Vivo</span>
                </div>
              </div>

              {/* Contenedor del Mapa */}
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#0B0F19] border border-[#00F0FF]/20">
                <img
                  src="https://images.unsplash.com/photo-1516037172336-512c4aa6b16a?w=1200"
                  alt="Festival Map"
                  className="w-full h-full object-cover opacity-20 grayscale"
                />

                <div className="absolute inset-0">
                  {/* Puntos de Interés (Zonas) */}
                  <div className="absolute top-[20%] left-[50%] -translate-x-1/2">
                    <div className="px-4 py-2 bg-[#00F0FF]/10 border border-[#00F0FF]/40 rounded-full backdrop-blur-md">
                      <span className="text-[10px] font-bold text-[#00F0FF] uppercase">Main Stage</span>
                    </div>
                  </div>

                  {/* Renderizado de Amigos con Framer Motion para suavizar el movimiento */}
                  {friends.map((f) => (
                    <motion.div
                      key={f.id}
                      layout // Suaviza el cambio de posición
                      transition={{ type: "spring", stiffness: 50 }}
                      className="absolute cursor-pointer z-20"
                      style={{
                        left: `${f.position.x}%`,
                        top: `${f.position.y}%`,
                      }}
                      onClick={() => setSelectedFriendId(f.id)}
                    >
                      <div className="relative -translate-x-1/2 -translate-y-1/2">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center text-[#F8FAFC] font-bold shadow-lg transition-all ${
                            selectedFriendId === f.id
                              ? 'bg-gradient-to-br from-[#FF2A5F] to-[#00F0FF] ring-4 ring-[#FF2A5F] scale-125'
                              : 'bg-gradient-to-br from-[#1A2235] to-[#0B0F19] border-2 border-[#FF2A5F]'
                          }`}
                        >
                          {f.avatar}
                        </div>
                        {/* Pulso de radar */}
                        <motion.div
                          animate={{ scale: [1, 1.8], opacity: [0.5, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute inset-0 rounded-full bg-[#FF2A5F] -z-10"
                        />
                      </div>
                    </motion.div>
                  ))}

                  {/* Tu Ubicación */}
                  <div className="absolute top-[60%] left-[45%] -translate-x-1/2 -translate-y-1/2 z-30">
                    <div className="w-4 h-4 rounded-full bg-[#00F0FF] shadow-[0_0_15px_rgba(0,240,255,0.8)] ring-4 ring-[#00F0FF]/20" />
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-[#00F0FF] text-[#0B0F19] text-[10px] px-2 py-0.5 rounded font-bold uppercase">Tú</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Friends Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-[#1A2235] border border-[#FF2A5F]/30 rounded-3xl p-6 shadow-xl h-full flex flex-col">
              <h2 className="text-2xl mb-6 text-[#F8FAFC] flex items-center font-bold">
                <Users className="w-6 h-6 mr-3 text-[#FF2A5F]" />
                Squad ({friends.length})
              </h2>

              <div className="space-y-3 flex-1 overflow-y-auto pr-2">
                {friends.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFriendId(f.id)}
                    className={`w-full p-4 rounded-2xl transition-all border ${
                      selectedFriendId === f.id
                        ? 'bg-[#FF2A5F]/10 border-[#FF2A5F]'
                        : 'bg-[#0B0F19]/50 border-transparent hover:border-[#94A3B8]/30'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF2A5F] to-[#00F0FF] flex items-center justify-center text-[#F8FAFC] font-bold text-sm">
                        {f.avatar}
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className={`font-bold ${selectedFriendId === f.id ? 'text-[#FF2A5F]' : 'text-[#F8FAFC]'}`}>
                          {f.name}
                        </h3>
                        <p className="text-[10px] text-[#94A3B8] uppercase flex items-center">
                          <MapPin className="w-3 h-3 mr-1" /> Activo ahora
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {selectedFriend && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-5 rounded-2xl bg-[#0B0F19] border border-[#FF2A5F]/50"
                >
                  <h3 className="text-[#F8FAFC] font-bold mb-1">{selectedFriend.name}</h3>
                  <p className="text-xs text-[#94A3B8] mb-4">Cerca de: Main Stage</p>
                  <button 
                    onClick={() => {
                      // Lanzamos el toast
                      toast.info(`Zumbido enviado a ${selectedFriend.name}`, {
                        description: "Tu squad ha recibido tu ubicación actual.",
                        duration: 3000,
                        icon: <Navigation className="w-4 h-4 text-[#00F0FF]" />,
                      });
                    }}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF2A5F] to-[#00F0FF] text-[#F8FAFC] font-bold text-sm shadow-lg hover:brightness-110 transition-all active:scale-95"
                  >
                    Enviar Ubicación
                </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};