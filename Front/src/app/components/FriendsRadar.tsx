import React, { useState } from 'react';
import { mockFriends } from '../data/mockData';
import { Users, MapPin, Navigation } from 'lucide-react';
import { motion } from 'motion/react';

export const FriendsRadar: React.FC = () => {
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);

  const friend = mockFriends.find((f) => f.id === selectedFriend);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-950 to-black">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl mb-2 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
            Radar de Amigos
          </h1>
          <p className="text-xl text-gray-400">Encuentra a tus amigos en el festival</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-pink-500/30 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl text-white">Mapa del Festival</h2>
                <div className="flex items-center space-x-2 text-gray-400">
                  <Navigation className="w-5 h-5" />
                  <span className="text-sm">Actualización en tiempo real</span>
                </div>
              </div>

              {/* Festival Map */}
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gradient-to-br from-purple-950 to-pink-950">
                <img
                  src="https://images.unsplash.com/photo-1516037172336-512c4aa6b16a?w=1200"
                  alt="Festival Map"
                  className="w-full h-full object-cover opacity-30"
                />

                {/* Map Elements */}
                <div className="absolute inset-0">
                  {/* Main Stage */}
                  <div className="absolute top-[20%] left-[50%] transform -translate-x-1/2 text-center">
                    <div className="w-24 h-16 bg-purple-500/30 border-2 border-purple-400 rounded-lg flex items-center justify-center backdrop-blur-sm">
                      <span className="text-xs text-white">Main Stage</span>
                    </div>
                  </div>

                  {/* VIP Area */}
                  <div className="absolute top-[45%] right-[15%] text-center">
                    <div className="w-20 h-12 bg-pink-500/30 border-2 border-pink-400 rounded-lg flex items-center justify-center backdrop-blur-sm">
                      <span className="text-xs text-white">VIP</span>
                    </div>
                  </div>

                  {/* Food Area */}
                  <div className="absolute bottom-[25%] left-[20%] text-center">
                    <div className="w-20 h-12 bg-blue-500/30 border-2 border-blue-400 rounded-lg flex items-center justify-center backdrop-blur-sm">
                      <span className="text-xs text-white">Food</span>
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
                          className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition-all ${
                            selectedFriend === friend.id
                              ? 'bg-gradient-to-br from-pink-500 to-purple-500 ring-4 ring-pink-400/50'
                              : 'bg-gradient-to-br from-pink-600 to-purple-600'
                          }`}
                        >
                          {friend.avatar}
                        </div>
                        <motion.div
                          animate={{ scale: [1, 1.5, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute inset-0 rounded-full bg-pink-500/30 -z-10"
                        />
                      </div>
                      <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                        <div className="px-3 py-1 rounded-lg bg-black/80 backdrop-blur-sm text-xs text-white">
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
                      <div className="w-4 h-4 rounded-full bg-blue-500 ring-4 ring-blue-400/50" />
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                        <div className="px-2 py-1 rounded-lg bg-blue-500/90 backdrop-blur-sm text-xs text-white">
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
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-sm text-gray-400">Tu ubicación</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-br from-pink-500 to-purple-500" />
                  <span className="text-sm text-gray-400">Amigos</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Friends List */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-pink-500/30 rounded-2xl p-6">
              <h2 className="text-2xl mb-6 text-white flex items-center">
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
                        ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/50'
                        : 'bg-purple-900/20 hover:bg-purple-900/30 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-white flex-shrink-0">
                        {friend.avatar}
                      </div>
                      <div className="flex-1 text-left">
                        <h3
                          className={`${
                            selectedFriend === friend.id ? 'text-pink-400' : 'text-white'
                          }`}
                        >
                          {friend.name}
                        </h3>
                        <div className="flex items-center text-xs text-gray-400 mt-1">
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
                  className="mt-6 p-4 rounded-xl bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-500/30"
                >
                  <h3 className="text-white mb-2">{friend.name}</h3>
                  <p className="text-sm text-gray-400 mb-3">
                    Ubicación: ({friend.position.x}%, {friend.position.y}%)
                  </p>
                  <button className="w-full py-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white transition-all">
                    Enviar mensaje
                  </button>
                </motion.div>
              )}
            </div>

            <div className="mt-6 p-6 bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border border-blue-500/30 rounded-2xl">
              <Navigation className="w-8 h-8 text-blue-400 mb-3" />
              <h3 className="text-lg text-white mb-2">Navegación en tiempo real</h3>
              <p className="text-sm text-gray-400">
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
