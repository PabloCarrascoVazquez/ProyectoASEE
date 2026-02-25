import React, { useState } from 'react';
import { mockFriends } from '../data/mockData';
import { Users, MapPin, Navigation } from 'lucide-react';
import { motion } from 'motion/react';

export const FriendsRadar: React.FC = () => {
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);

  const friend = mockFriends.find((f) => f.id === selectedFriend);

  return (
    <div className="min-h-screen bg-[#0B0F19]">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl mb-2 bg-gradient-to-r from-[#FF2A5F] to-[#00F0FF] bg-clip-text text-transparent">
            Radar de Amigos
          </h1>
          <p className="text-xl text-[#94A3B8]">Encuentra a tus amigos en el festival</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#1A2235] border border-[#FF2A5F]/30 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl text-[#F8FAFC]">Mapa del Festival</h2>
                <div className="flex items-center space-x-2 text-[#94A3B8]">
                  <Navigation className="w-5 h-5" />
                  <span className="text-sm">Actualización en tiempo real</span>
                </div>
              </div>

              {/* Festival Map */}
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-[#0B0F19]">
                <img
                  src="https://images.unsplash.com/photo-1516037172336-512c4aa6b16a?w=1200"
                  alt="Festival Map"
                  className="w-full h-full object-cover opacity-30"
                />

                {/* Map Elements */}
                <div className="absolute inset-0">
                  {/* Main Stage */}
                  <div className="absolute top-[20%] left-[50%] transform -translate-x-1/2 text-center">
                    <div className="w-24 h-16 bg-[#00F0FF]/30 border-2 border-[#00F0FF] rounded-lg flex items-center justify-center backdrop-blur-sm">
                      <span className="text-xs text-[#F8FAFC]">Main Stage</span>
                    </div>
                  </div>

                  {/* VIP Area */}
                  <div className="absolute top-[45%] right-[15%] text-center">
                    <div className="w-20 h-12 bg-[#FF2A5F]/30 border-2 border-[#FF2A5F] rounded-lg flex items-center justify-center backdrop-blur-sm">
                      <span className="text-xs text-[#F8FAFC]">VIP</span>
                    </div>
                  </div>

                  {/* Food Area */}
                  <div className="absolute bottom-[25%] left-[20%] text-center">
                    <div className="w-20 h-12 bg-[#00F0FF]/30 border-2 border-[#00F0FF] rounded-lg flex items-center justify-center backdrop-blur-sm">
                      <span className="text-xs text-[#F8FAFC]">Food</span>
                    </div>
                  </div>

                  {/* Friends Markers */}
                  {mockFriends.map((friend) => (
                    <motion.div
                      key={friend.id}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      whileHover={{ scale: 1.2 }}
                      className="absolute cursor-pointer"
                      style={{
                        left: `${friend.position.x}%`,
                        top: `${friend.position.y}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                      onClick={() => setSelectedFriend(friend.id)}
                    >
                      <div className="relative">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center text-[#F8FAFC] transition-all ${
                            selectedFriend === friend.id
                              ? 'bg-gradient-to-br from-[#FF2A5F] to-[#00F0FF] ring-4 ring-[#FF2A5F]/50'
                              : 'bg-gradient-to-br from-[#E62555] to-[#00D8E6]'
                          }`}
                        >
                          {friend.avatar}
                        </div>
                        <motion.div
                          animate={{ scale: [1, 1.5, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute inset-0 rounded-full bg-[#FF2A5F]/30 -z-10"
                        />
                      </div>
                      <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                        <div className="px-3 py-1 rounded-lg bg-[#0B0F19]/80 backdrop-blur-sm text-xs text-[#F8FAFC]">
                          {friend.name}
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* Your Location */}
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute top-[60%] left-[45%] transform -translate-x-1/2 -translate-y-1/2"
                  >
                    <div className="relative">
                      <div className="w-4 h-4 rounded-full bg-[#00F0FF] ring-4 ring-[#00F0FF]/50" />
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                        <div className="px-2 py-1 rounded-lg bg-[#00F0FF]/90 backdrop-blur-sm text-xs text-[#0B0F19]">
                          Tú
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Legend */}
              <div className="mt-6 flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-[#00F0FF]" />
                  <span className="text-sm text-[#94A3B8]">Tu ubicación</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-br from-[#FF2A5F] to-[#00F0FF]" />
                  <span className="text-sm text-[#94A3B8]">Amigos</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Friends List */}
          <div className="lg:col-span-1">
            <div className="bg-[#1A2235] border border-[#FF2A5F]/30 rounded-2xl p-6">
              <h2 className="text-2xl mb-6 text-[#F8FAFC] flex items-center">
                <Users className="w-6 h-6 mr-2" />
                Amigos ({mockFriends.length})
              </h2>

              <div className="space-y-3">
                {mockFriends.map((friend) => (
                  <button
                    key={friend.id}
                    onClick={() => setSelectedFriend(friend.id)}
                    className={`w-full p-4 rounded-xl transition-all ${
                      selectedFriend === friend.id
                        ? 'bg-gradient-to-r from-[#FF2A5F]/20 to-[#00F0FF]/20 border border-[#FF2A5F]/50'
                        : 'bg-[#0B0F19]/50 hover:bg-[#0B0F19] border border-transparent'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF2A5F] to-[#00F0FF] flex items-center justify-center text-[#F8FAFC] flex-shrink-0">
                        {friend.avatar}
                      </div>
                      <div className="flex-1 text-left">
                        <h3
                          className={`${
                            selectedFriend === friend.id ? 'text-[#FF2A5F]' : 'text-[#F8FAFC]'
                          }`}
                        >
                          {friend.name}
                        </h3>
                        <div className="flex items-center text-xs text-[#94A3B8] mt-1">
                          <MapPin className="w-3 h-3 mr-1" />
                          <span>En el festival</span>
                        </div>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                    </div>
                  </button>
                ))}
              </div>

              {selectedFriend && friend && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 rounded-xl bg-gradient-to-br from-[#FF2A5F]/10 to-[#00F0FF]/10 border border-[#FF2A5F]/30"
                >
                  <h3 className="text-[#F8FAFC] mb-2">{friend.name}</h3>
                  <p className="text-sm text-[#94A3B8] mb-3">
                    Ubicación: ({friend.position.x}%, {friend.position.y}%)
                  </p>
                  <button className="w-full py-2 rounded-lg bg-gradient-to-r from-[#FF2A5F] to-[#00F0FF] hover:from-[#E62555] hover:to-[#00D8E6] text-[#F8FAFC] transition-all">
                    Enviar mensaje
                  </button>
                </motion.div>
              )}
            </div>

            <div className="mt-6 p-6 bg-[#0B0F19] border border-[#00F0FF]/30 rounded-2xl">
              <Navigation className="w-8 h-8 text-[#00F0FF] mb-3" />
              <h3 className="text-lg text-[#F8FAFC] mb-2">Navegación en tiempo real</h3>
              <p className="text-sm text-[#94A3B8]">
                El radar se actualiza automáticamente cada 30 segundos para mostrarte la ubicación
                de tus amigos
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
