import React, { useState } from 'react';
import { mockEvents } from '../data/mockData';
import { Play, Pause, SkipBack, SkipForward, Music, Volume2 } from 'lucide-react';
import { motion } from 'motion/react';

export const MusicPlayer: React.FC = () => {
  const [currentArtist, setCurrentArtist] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const allArtists = mockEvents.flatMap((event) => event.artists);

  const handlePrevious = () => {
    setCurrentArtist((prev) => (prev === 0 ? allArtists.length - 1 : prev - 1));
    setIsPlaying(true);
  };

  const handleNext = () => {
    setCurrentArtist((prev) => (prev === allArtists.length - 1 ? 0 : prev + 1));
    setIsPlaying(true);
  };

  const currentTrack = allArtists[currentArtist];

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-950 to-black">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl mb-2 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
            Reproductor de Música
          </h1>
          <p className="text-xl text-gray-400">Descubre los artistas de Subsonic Festival</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Player */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-pink-500/30 rounded-2xl p-8"
            >
              {/* Album Art */}
              <div className="relative mb-8 rounded-2xl overflow-hidden aspect-square max-w-md mx-auto">
                <img
                  src={currentTrack.image}
                  alt={currentTrack.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent flex items-end">
                  <div className="p-8 w-full">
                    <h2 className="text-4xl mb-2 text-white">{currentTrack.name}</h2>
                    <p className="text-xl text-pink-400">{currentTrack.genre}</p>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                  <span>1:23</span>
                  <span>3:45</span>
                </div>
                <div className="h-2 bg-purple-900/50 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: isPlaying ? '40%' : '0%' }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="h-full bg-gradient-to-r from-pink-500 to-purple-500"
                  />
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={handlePrevious}
                  className="p-3 rounded-full bg-purple-500/20 hover:bg-purple-500/30 transition-colors"
                >
                  <SkipBack className="w-6 h-6 text-purple-400" />
                </button>

                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-6 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 transition-all shadow-lg shadow-pink-500/50"
                >
                  {isPlaying ? (
                    <Pause className="w-8 h-8 text-white" />
                  ) : (
                    <Play className="w-8 h-8 text-white ml-1" />
                  )}
                </button>

                <button
                  onClick={handleNext}
                  className="p-3 rounded-full bg-purple-500/20 hover:bg-purple-500/30 transition-colors"
                >
                  <SkipForward className="w-6 h-6 text-purple-400" />
                </button>
              </div>

              {/* Volume */}
              <div className="mt-8 flex items-center space-x-4">
                <Volume2 className="w-5 h-5 text-gray-400" />
                <div className="flex-1 h-2 bg-purple-900/50 rounded-full overflow-hidden">
                  <div className="h-full w-3/4 bg-gradient-to-r from-pink-500 to-purple-500" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Artist List */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-pink-500/30 rounded-2xl p-6">
              <h2 className="text-2xl mb-6 text-white">Line-up</h2>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {allArtists.map((artist, index) => (
                  <button
                    key={`${artist.id}-${index}`}
                    onClick={() => {
                      setCurrentArtist(index);
                      setIsPlaying(true);
                    }}
                    className={`w-full p-4 rounded-xl transition-all ${
                      currentArtist === index
                        ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/50'
                        : 'bg-purple-900/20 hover:bg-purple-900/30 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={artist.image}
                          alt={artist.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className={`${currentArtist === index ? 'text-pink-400' : 'text-white'}`}>
                          {artist.name}
                        </h3>
                        <p className="text-sm text-gray-400">{artist.genre}</p>
                      </div>
                      {currentArtist === index && isPlaying && (
                        <div className="flex space-x-1">
                          <motion.div
                            animate={{ height: [8, 16, 8] }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                            className="w-1 bg-pink-400 rounded-full"
                          />
                          <motion.div
                            animate={{ height: [16, 8, 16] }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                            className="w-1 bg-pink-400 rounded-full"
                          />
                          <motion.div
                            animate={{ height: [8, 16, 8] }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                            className="w-1 bg-pink-400 rounded-full"
                          />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 p-6 bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border border-blue-500/30 rounded-2xl">
              <Music className="w-8 h-8 text-blue-400 mb-3" />
              <h3 className="text-lg text-white mb-2">Integración con Spotify</h3>
              <p className="text-sm text-gray-400 mb-4">
                Conecta tu cuenta de Spotify para escuchar los tracks completos
              </p>
              <button className="w-full py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors">
                Conectar Spotify
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
