import React, { useState, useEffect } from 'react';
import { userTicketService, PurchasedTicket } from '../services/userTicketService';
import { Ticket, QrCode, Calendar, Trash2, X, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';

export const MyTickets: React.FC = () => {
  const [purchasedTickets, setPurchasedTickets] = useState<PurchasedTicket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // --- CARGA DE DATOS DESDE EL SERVICIO ---
  const loadTickets = async () => {
    setLoading(true);
    try {
      const data = await userTicketService.getUserWallet();
      console.log("DATOS MAPEADOS EN EL FRONT:", data);
      setPurchasedTickets(data);
    } catch (error) {
      toast.error('Error al sincronizar tus entradas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  // --- ACCIONES ---
  const handleCancelTicket = async (ticketId: string) => {
    if (window.confirm('¿Estás seguro de que quieres cancelar esta entrada?')) {
      try {
        await userTicketService.cancel(ticketId);
        toast.success('Entrada cancelada correctamente');
        setSelectedTicketId(null);
        // Recargamos la lista para reflejar los cambios del servidor
        loadTickets();
      } catch (error) {
        toast.error('No se pudo cancelar la entrada');
      }
    }
  };

  const selectedTicket = purchasedTickets.find((t) => t.id === selectedTicketId);

  // --- RENDER DE CARGA ---
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#FF2A5F] animate-spin mb-4" />
        <p className="text-[#94A3B8] font-bold tracking-widest uppercase text-xs">Accediendo a tu Wallet...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F19]">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl mb-2 bg-gradient-to-r from-[#FF2A5F] to-[#00F0FF] bg-clip-text text-transparent font-black uppercase tracking-tighter">
            Mis Entradas
          </h1>
          <p className="text-xl text-[#94A3B8] font-light">
            Tienes {purchasedTickets.length} ticket{purchasedTickets.length !== 1 ? 's' : ''} en tu cuenta
          </p>
        </motion.div>

        {/* Empty State */}
        {purchasedTickets.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-3xl">
            <Ticket className="w-24 h-24 mx-auto mb-6 text-[#94A3B8]/20" />
            <h2 className="text-2xl mb-4 text-[#F8FAFC] font-bold italic uppercase">Tu wallet está vacía</h2>
            <p className="text-[#94A3B8] mb-8">Parece que aún no tienes pases para la próxima rave.</p>
          </div>
        ) : (
          /* Grid de Entradas */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {purchasedTickets.map((ticket, index) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group cursor-pointer"
                onClick={() => setSelectedTicketId(ticket.id)}
              >
                <div className="bg-[#1A2235] border border-[#FF2A5F]/30 hover:border-[#FF2A5F]/60 rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.03] shadow-lg">
                  {ticket.image && (
                    <div className="h-48 overflow-hidden relative">
                      <img
                        src={ticket.image}
                        alt={ticket.eventName}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1A2235] to-transparent opacity-60" />
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <Ticket className="w-6 h-6 text-[#FF2A5F]" />
                      <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">
                        ID: {ticket.id.slice(-8)}
                      </span>
                    </div>

                    <h3 className="text-xl mb-1 text-[#F8FAFC] font-black uppercase tracking-tight italic line-clamp-1">
                      {ticket.eventName}
                    </h3>
                    <p className="text-xs font-bold text-[#00F0FF] mb-4 uppercase tracking-wider">
                      {ticket.ticketType}
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center text-[#94A3B8] text-xs font-bold uppercase">
                        <Calendar className="w-4 h-4 mr-2 text-[#FF2A5F]" />
                        <span>
                          {new Date(ticket.eventDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                        </span>
                      </div>
                      <span className="text-[#F8FAFC] font-black text-lg">€{ticket.price}</span>
                    </div>

                    <div className="flex items-center justify-center py-3 rounded-xl bg-[#0B0F19]/80 border border-[#00F0FF]/30 group-hover:bg-[#00F0FF]/10 transition-all">
                      <QrCode className="w-5 h-5 text-[#00F0FF] mr-2" />
                      <span className="text-xs font-black text-[#00F0FF] uppercase tracking-tighter">Acceder al QR</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {selectedTicketId && selectedTicket && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1A2235] border-2 border-[#FF2A5F]/50 rounded-3xl p-8 max-w-md w-full relative shadow-[0_0_50px_rgba(255,42,95,0.2)]"
          >
            <button
              onClick={() => setSelectedTicketId(null)}
              className="absolute top-6 right-6 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            <div className="text-center">
              <Ticket className="w-12 h-12 mx-auto mb-4 text-[#FF2A5F]" />
              <h2 className="text-2xl font-black text-[#F8FAFC] uppercase tracking-tighter italic mb-1">
                {selectedTicket.eventName}
              </h2>
              <p className="text-[#00F0FF] font-bold text-sm mb-6 uppercase tracking-widest">
                {selectedTicket.ticketType}
              </p>

              <div className="bg-white p-6 rounded-2xl mb-6 inline-block shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                <QRCodeSVG value={selectedTicket.qrCode} size={200} />
              </div>

              <div className="bg-[#0B0F19] border border-[#00F0FF]/30 rounded-2xl p-4 mb-6">
                <p className="text-[10px] text-[#94A3B8] uppercase font-black mb-1">Validation Code</p>
                <p className="text-lg text-[#F8FAFC] font-mono font-bold tracking-widest">
                  {selectedTicket.qrCode}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8 border-t border-white/5 pt-6">
                <div className="text-left">
                  <p className="text-[10px] text-[#94A3B8] uppercase font-black">Adquirido</p>
                  <p className="text-white font-bold text-sm">
                    {new Date(selectedTicket.purchaseDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-[#94A3B8] uppercase font-black">Price</p>
                  <p className="text-[#FF2A5F] font-black text-lg">€{selectedTicket.price}</p>
                </div>
              </div>

              <button
                onClick={() => handleCancelTicket(selectedTicket.id)}
                className="w-full py-4 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center space-x-2 border border-red-500/20"
              >
                <Trash2 className="w-4 h-4" />
                <span>Cancelar Entrada</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};