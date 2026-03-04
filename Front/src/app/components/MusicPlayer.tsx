import React, { useState, useEffect } from 'react';
import { Artist, Event } from '../data/mockData';
import { eventService } from '../services/eventService'; // Importamos el servicio
import { Play, Pause, SkipBack, SkipForward, Music, Volume2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

export const MusicPlayer: React.FC = () => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentArtistIndex, setCurrentArtistIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // --- CARGA DE DATOS ---
  useEffect(() => {
    const loadArtists = async () => {
      try {
        const events: Event[] = await eventService.getAll();
        // Aplanamos todos los artistas de todos los eventos en una sola lista
        const allArtists = events.flatMap((event) => event.artists);
        setArtists(allArtists);
      } catch (error) {
        toast.error('No se pudo cargar la playlist del festival');
      } finally {
        setLoading(false);
      }
    };
    loadArtists();
  }, []);

  // --- CONTROLES ---
  const handlePrevious = () => {
    setCurrentArtistIndex((prev) => (prev === 0 ? artists.length - 1 : prev - 1));
    setIsPlaying(true);
  };

  const handleNext = () => {
    setCurrentArtistIndex((prev) => (prev === artists.length - 1 ? 0 : prev + 1));
    setIsPlaying(true);
  };

  const currentTrack = artists[currentArtistIndex];

  // --- RENDER DE CARGA ---
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#FF2A5F] animate-spin mb-4" />
        <p className="text-[#94A3B8] font-bold tracking-widest uppercase">Sintonizando Line-up...</p>
      </div>
    );
  }

  // --- RENDER SI NO HAY ARTISTAS ---
  if (artists.length === 0) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center text-[#94A3B8]">
        No hay artistas disponibles en este momento.
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
          <h1 className="text-4xl md:text-5xl mb-2 bg-gradient-to-r from-[#FF2A5F] to-[#00F0FF] bg-clip-text text-transparent font-black uppercase">
            Reproductor de Música
          </h1>
          <p className="text-xl text-[#94A3B8]">Descubre los tracks de Subsonic 2026</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Player Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#1A2235] border border-[#FF2A5F]/30 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
            >
              {/* Visualizador de fondo sutil */}
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="flex items-end justify-around h-full w-full px-10 pb-10">
                  {[...Array(20)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ height: isPlaying ? [20, 100, 40, 80, 20] : 10 }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                      className="w-2 bg-[#00F0FF] rounded-t-full"
                    />
                  ))}
                </div>
              </div>

              {/* Album Art con AnimatePresence para transiciones suaves */}
              <div className="relative mb-8 rounded-2xl overflow-hidden aspect-square max-w-sm mx-auto shadow-[0_0_50px_rgba(255,42,95,0.3)] z-10">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentTrack.id}
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -100, opacity: 0 }}
                    src={currentTrack.image}
                    alt={currentTrack.name}
                    className="w-full h-full object-cover"
                  />
                </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-transparent to-transparent flex items-end p-8">
                  <div className="w-full">
                    <h2 className="text-4xl mb-1 text-[#F8FAFC] font-black italic uppercase tracking-tighter">{currentTrack.name}</h2>
                    <p className="text-lg text-[#00F0FF] font-bold tracking-widest uppercase">{currentTrack.genre}</p>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6 relative z-10">
                <div className="flex items-center justify-between text-[10px] font-bold text-[#94A3B8] mb-2 uppercase tracking-widest">
                  <span>{isPlaying ? "01:23" : "00:00"}</span>
                  <span>03:45</span>
                </div>
                <div className="h-1.5 bg-[#0B0F19] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: isPlaying ? '100%' : '0%' }}
                    transition={{ duration: 225, ease: "linear" }} // Simula duración de canción
                    className="h-full bg-gradient-to-r from-[#FF2A5F] to-[#00F0FF]"
                  />
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center space-x-6 relative z-10">
                <button
                  onClick={handlePrevious}
                  className="p-4 rounded-full bg-[#1A2235] border border-[#FF2A5F]/20 hover:border-[#FF2A5F] text-[#F8FAFC] transition-all hover:scale-110"
                >
                  <SkipBack className="w-6 h-6" />
                </button>

                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-8 rounded-full bg-gradient-to-br from-[#FF2A5F] to-[#E62555] hover:scale-110 transition-all shadow-[0_0_25px_rgba(255,42,95,0.6)]"
                >
                  {isPlaying ? (
                    <Pause className="w-10 h-10 text-white fill-current" />
                  ) : (
                    <Play className="w-10 h-10 text-white fill-current ml-1" />
                  )}
                </button>

                <button
                  onClick={handleNext}
                  className="p-4 rounded-full bg-[#1A2235] border border-[#FF2A5F]/20 hover:border-[#FF2A5F] text-[#F8FAFC] transition-all hover:scale-110"
                >
                  <SkipForward className="w-6 h-6" />
                </button>
              </div>

              {/* Volume */}
              <div className="mt-10 flex items-center space-x-4 opacity-50 hover:opacity-100 transition-opacity relative z-10">
                <Volume2 className="w-4 h-4 text-[#94A3B8]" />
                <div className="flex-1 h-1 bg-[#0B0F19] rounded-full">
                  <div className="h-full w-3/4 bg-[#94A3B8]" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Artist List Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-[#1A2235] border border-[#FF2A5F]/30 rounded-3xl p-6 shadow-xl flex flex-col h-full max-h-[750px]">
              <h2 className="text-xl mb-6 text-[#F8FAFC] font-black uppercase flex items-center">
                <Music className="w-5 h-5 mr-3 text-[#FF2A5F]" />
                Playlist del Festival
              </h2>
              <div className="space-y-2 overflow-y-auto pr-2 custom-scrollbar">
                {artists.map((artist, index) => (
                  <button
                    key={`${artist.id}-${index}`}
                    onClick={() => {
                      setCurrentArtistIndex(index);
                      setIsPlaying(true);
                    }}
                    className={`w-full p-3 rounded-2xl transition-all border ${
                      currentArtistIndex === index
                        ? 'bg-[#FF2A5F]/10 border-[#FF2A5F]/50 shadow-[0_0_15px_rgba(255,42,95,0.1)]'
                        : 'bg-[#0B0F19]/40 border-transparent hover:bg-[#0B0F19]/80'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border-2 ${currentArtistIndex === index ? 'border-[#FF2A5F]' : 'border-transparent'}`}>
                        <img
                          src={artist.image}
                          alt={artist.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className={`font-bold text-sm ${currentArtistIndex === index ? 'text-[#FF2A5F]' : 'text-[#F8FAFC]'}`}>
                          {artist.name}
                        </h3>
                        <p className="text-[10px] text-[#94A3B8] uppercase tracking-tighter">{artist.genre}</p>
                      </div>
                      
                      {currentArtistIndex === index && isPlaying && (
                        <div className="flex items-end space-x-0.5 h-4">
                          {[...Array(3)].map((_, i) => (
                            <motion.div
                              key={i}
                              animate={{ height: [4, 12, 4] }}
                              transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.2 }}
                              className="w-1 bg-[#FF2A5F] rounded-full"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-8 p-5 bg-[#0B0F19]/80 border border-[#00F0FF]/30 rounded-2xl shadow-inner">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <Music className="w-5 h-5 text-green-500" />
                  </div>
                  <h3 className="text-sm font-bold text-[#F8FAFC] uppercase italic">Spotify Sync</h3>
                </div>
                <p className="text-[11px] text-[#94A3B8] leading-relaxed mb-4">
                  Sincroniza tu cuenta para guardar el Line-up en tus favoritos.
                </p>
                <button className="w-full py-2.5 rounded-xl bg-[#1DB954] hover:bg-[#1ed760] text-white font-black text-[10px] uppercase tracking-widest transition-all shadow-lg">
                  Conectar Cuenta
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};