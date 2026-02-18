import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { Ticket, QrCode, Calendar, Trash2, X } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';

export const MyTickets: React.FC = () => {
  const { purchasedTickets, cancelTicket } = useCart();
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);

  const handleCancelTicket = (ticketId: string, ticketName: string) => {
    if (window.confirm('¿Estás seguro de que quieres cancelar esta entrada?')) {
      cancelTicket(ticketId);
      toast.success('Entrada cancelada');
      setSelectedTicket(null);
    }
  };

  const ticket = purchasedTickets.find((t) => t.id === selectedTicket);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-950 to-black">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl mb-2 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
            Mis Entradas
          </h1>
          <p className="text-xl text-gray-400">
            {purchasedTickets.length} entrada{purchasedTickets.length !== 1 ? 's' : ''} comprada
            {purchasedTickets.length !== 1 ? 's' : ''}
          </p>
        </motion.div>

        {purchasedTickets.length === 0 ? (
          <div className="text-center py-20">
            <Ticket className="w-24 h-24 mx-auto mb-6 text-gray-600" />
            <h2 className="text-2xl mb-4 text-white">No tienes entradas aún</h2>
            <p className="text-gray-400 mb-8">Compra entradas para tus eventos favoritos</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {purchasedTickets.map((ticket, index) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group cursor-pointer"
                onClick={() => setSelectedTicket(ticket.id)}
              >
                <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-pink-500/30 hover:border-pink-500/60 rounded-2xl overflow-hidden transition-all hover:scale-105">
                  {ticket.image && (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={ticket.image}
                        alt={ticket.eventName}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <Ticket className="w-6 h-6 text-pink-400" />
                      <span className="text-xs text-gray-400">
                        #{ticket.id.slice(-8).toUpperCase()}
                      </span>
                    </div>

                    <h3 className="text-xl mb-2 text-white">{ticket.eventName}</h3>
                    <p className="text-sm text-gray-400 mb-4">{ticket.ticketType}</p>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center text-gray-400 text-sm">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>
                          {new Date(ticket.purchaseDate).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                      <span className="text-pink-400">€{ticket.price}</span>
                    </div>

                    <div className="flex items-center justify-center py-3 rounded-lg bg-purple-900/30 border border-purple-500/30">
                      <QrCode className="w-5 h-5 text-purple-400 mr-2" />
                      <span className="text-sm text-purple-400">Ver código QR</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {selectedTicket && ticket && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-purple-900 to-pink-900 border-2 border-pink-500/50 rounded-2xl p-8 max-w-md w-full relative"
          >
            <button
              onClick={() => setSelectedTicket(null)}
              className="absolute top-4 right-4 p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors"
            >
              <X className="w-5 h-5 text-red-400" />
            </button>

            <div className="text-center">
              <Ticket className="w-12 h-12 mx-auto mb-4 text-pink-400" />
              <h2 className="text-2xl mb-2 text-white">{ticket.eventName}</h2>
              <p className="text-gray-400 mb-6">{ticket.ticketType}</p>

              <div className="bg-white p-6 rounded-xl mb-6 inline-block">
                <QRCodeSVG value={ticket.qrCode} size={200} />
              </div>

              <div className="bg-purple-900/50 border border-purple-500/30 rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-400 mb-1">Código de entrada</p>
                <p className="text-lg text-white font-mono">{ticket.qrCode}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-left">
                  <p className="text-xs text-gray-400 mb-1">Precio</p>
                  <p className="text-pink-400">€{ticket.price}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 mb-1">Fecha de compra</p>
                  <p className="text-gray-300">
                    {new Date(ticket.purchaseDate).toLocaleDateString('es-ES')}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleCancelTicket(ticket.id, ticket.eventName)}
                className="w-full py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all flex items-center justify-center space-x-2"
              >
                <Trash2 className="w-5 h-5" />
                <span>Cancelar entrada</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
