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
    <div className="min-h-screen bg-[#0B0F19]">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl mb-2 bg-gradient-to-r from-[#FF2A5F] to-[#00F0FF] bg-clip-text text-transparent">
            Reproductor de Música
          </h1>
          <p className="text-xl text-[#94A3B8]">Descubre los artistas de Subsonic Festival</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Player */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#1A2235] border border-[#FF2A5F]/30 rounded-2xl p-8"
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
                    <h2 className="text-4xl mb-2 text-[#F8FAFC]">{currentTrack.name}</h2>
                    <p className="text-xl text-[#FF2A5F]">{currentTrack.genre}</p>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between text-sm text-[#94A3B8] mb-2">
                  <span>1:23</span>
                  <span>3:45</span>
                </div>
                <div className="h-2 bg-[#0B0F19] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: isPlaying ? '40%' : '0%' }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="h-full bg-gradient-to-r from-[#FF2A5F] to-[#00F0FF]"
                  />
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={handlePrevious}
                  className="p-3 rounded-full bg-[#00F0FF]/20 hover:bg-[#00F0FF]/30 transition-colors"
                >
                  <SkipBack className="w-6 h-6 text-[#00F0FF]" />
                </button>

                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-6 rounded-full bg-gradient-to-r from-[#FF2A5F] to-[#00F0FF] hover:from-[#E62555] hover:to-[#00D8E6] transition-all shadow-lg shadow-[#FF2A5F]/50"
                >
                  {isPlaying ? (
                    <Pause className="w-8 h-8 text-[#F8FAFC]" />
                  ) : (
                    <Play className="w-8 h-8 text-[#F8FAFC] ml-1" />
                  )}
                </button>

                <button
                  onClick={handleNext}
                  className="p-3 rounded-full bg-[#00F0FF]/20 hover:bg-[#00F0FF]/30 transition-colors"
                >
                  <SkipForward className="w-6 h-6 text-[#00F0FF]" />
                </button>
              </div>

              {/* Volume */}
              <div className="mt-8 flex items-center space-x-4">
                <Volume2 className="w-5 h-5 text-[#94A3B8]" />
                <div className="flex-1 h-2 bg-[#0B0F19] rounded-full overflow-hidden">
                  <div className="h-full w-3/4 bg-gradient-to-r from-[#FF2A5F] to-[#00F0FF]" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Artist List */}
          <div className="lg:col-span-1">
            <div className="bg-[#1A2235] border border-[#FF2A5F]/30 rounded-2xl p-6">
              <h2 className="text-2xl mb-6 text-[#F8FAFC]">Line-up</h2>
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
                        ? 'bg-gradient-to-r from-[#FF2A5F]/20 to-[#00F0FF]/20 border border-[#FF2A5F]/50'
                        : 'bg-[#0B0F19]/50 hover:bg-[#0B0F19] border border-transparent'
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
                        <h3 className={`${currentArtist === index ? 'text-[#FF2A5F]' : 'text-[#F8FAFC]'}`}>
                          {artist.name}
                        </h3>
                        <p className="text-sm text-[#94A3B8]">{artist.genre}</p>
                      </div>
                      {currentArtist === index && isPlaying && (
                        <div className="flex space-x-1">
                          <motion.div
                            animate={{ height: [8, 16, 8] }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                            className="w-1 bg-[#FF2A5F] rounded-full"
                          />
                          <motion.div
                            animate={{ height: [16, 8, 16] }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                            className="w-1 bg-[#FF2A5F] rounded-full"
                          />
                          <motion.div
                            animate={{ height: [8, 16, 8] }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                            className="w-1 bg-[#FF2A5F] rounded-full"
                          />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 p-6 bg-[#0B0F19] border border-[#00F0FF]/30 rounded-2xl">
              <Music className="w-8 h-8 text-[#00F0FF] mb-3" />
              <h3 className="text-lg text-[#F8FAFC] mb-2">Integración con Spotify</h3>
              <p className="text-sm text-[#94A3B8] mb-4">
                Conecta tu cuenta de Spotify para escuchar los tracks completos
              </p>
              <button className="w-full py-2 rounded-lg bg-green-500 hover:bg-green-600 text-[#F8FAFC] transition-colors">
                Conectar Spotify
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
