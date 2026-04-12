import React, { useEffect, useState } from 'react';
import { useCart } from '../contexts/CartContext'; // Asegúrate de que tu context maneje el historial de merch
import { Package, Truck, Calendar, ShoppingBag, X, Info, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { userMerchService } from '../services/userMerchService';

// Interfaz para el historial de Merch (basada en tu esquema de backend)
interface MerchOrder {
  id: string;
  name: string;
  price: number;
  quantity: number;
  totalPrice: number;
  image: string;
  category: string;
  status: 'PENDING' | 'SHIPPED' | 'DELIVERED';
  purchaseDate: string;
}
 

export const MyMerch: React.FC = () => {
  const [purchasedMerch, setPurchasedMerch] = useState<MerchOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // --- CARGA DE DATOS DESDE EL BACKEND ---
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const orders = await userMerchService.getMyOrders();
        setPurchasedMerch(orders);
      } catch (error) {
        console.error("Error al cargar pedidos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const order = purchasedMerch.find((m) => m.id === selectedOrder);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED': return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'SHIPPED': return 'text-[#00F0FF] bg-[#00F0FF]/10 border-[#00F0FF]/30';
      default: return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'DELIVERED': return 'Entregado';
      case 'SHIPPED': return 'En camino';
      default: return 'Procesando';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#00F0FF] animate-spin mb-4" />
        <p className="text-[#94A3B8] animate-pulse">Consultando tus adquisiciones...</p>
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
            Mis Pedidos Merch
          </h1>
          <p className="text-xl text-[#94A3B8]">
            {purchasedMerch.length} artículo{purchasedMerch.length !== 1 ? 's' : ''} en tu colección
          </p>
        </motion.div>

        {purchasedMerch.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="w-24 h-24 mx-auto mb-6 text-[#94A3B8]/60" />
            <h2 className="text-2xl mb-4 text-[#F8FAFC] font-bold">Aún no has comprado Merch</h2>
            <p className="text-[#94A3B8] mb-8">Visita la tienda para equiparte con el estilo Subsonic</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {purchasedMerch.map((item: MerchOrder, index: number) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group cursor-pointer"
                onClick={() => setSelectedOrder(item.id)}
              >
                <div className="bg-[#1A2235] border border-[#00F0FF]/20 hover:border-[#00F0FF]/60 rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.03]">
                  {/* Image */}
                  <div className="h-56 overflow-hidden relative">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(item.status)} backdrop-blur-md`}>
                      {getStatusLabel(item.status)}
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-[#00F0FF] uppercase tracking-widest">{item.category}</span>
                      <span className="text-xs text-[#94A3B8]">#{item.id.slice(-6).toUpperCase()}</span>
                    </div>

                    <h3 className="text-xl mb-4 text-[#F8FAFC] font-bold group-hover:text-[#00F0FF] transition-colors uppercase">
                      {item.name}
                    </h3>

                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center text-[#94A3B8] text-sm font-medium">
                        <Calendar className="w-4 h-4 mr-2 text-[#FF2A5F]" />
                        {new Date(item.purchaseDate).toLocaleDateString('es-ES')}
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-[#94A3B8]">Cant: {item.quantity}</p>
                        <p className="text-lg font-bold text-[#F8FAFC]">€{item.totalPrice}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-center py-3 rounded-xl bg-[#0B0F19]/50 border border-[#FF2A5F]/20 group-hover:border-[#FF2A5F]/50 transition-colors">
                      <Info className="w-4 h-4 text-[#FF2A5F] mr-2" />
                      <span className="text-xs font-bold text-[#F8FAFC] uppercase tracking-tighter">Detalles del Envío</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && order && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1A2235] border-2 border-[#00F0FF]/30 rounded-3xl p-8 max-w-md w-full relative shadow-[0_0_50px_rgba(0,240,255,0.2)]"
          >
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-6 right-6 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            <div className="text-center">
              <div className={`w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center bg-gradient-to-br ${order.status === 'SHIPPED' ? 'from-[#00F0FF] to-blue-600' : 'from-[#FF2A5F] to-purple-600'} shadow-lg`}>
                <Package className="w-10 h-10 text-white" />
              </div>

              <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-1">{order.name}</h2>
              <p className="text-[#00F0FF] font-bold text-sm mb-8">Pedido #{order.id.toUpperCase()}</p>

              {/* Status Timeline Simulado */}
              <div className="space-y-6 text-left mb-8 bg-[#0B0F19] p-6 rounded-2xl border border-white/5">
                <div className="flex items-start space-x-4">
                  <div className={`mt-1 w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]`}></div>
                  <div>
                    <p className="text-sm font-bold text-white uppercase">Pedido Confirmado</p>
                    <p className="text-xs text-[#94A3B8]">{new Date(order.purchaseDate).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className={`mt-1 w-3 h-3 rounded-full ${order.status === 'SHIPPED' || order.status === 'DELIVERED' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-gray-600'}`}></div>
                  <div>
                    <p className="text-sm font-bold text-white uppercase">Enviado por Subsonic Logistics</p>
                    <p className="text-xs text-[#94A3B8]">{order.status === 'SHIPPED' ? 'En tránsito hacia tu ubicación' : 'Pendiente de salida'}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-6">
                <div className="text-left">
                  <p className="text-[10px] text-[#94A3B8] uppercase font-black">Total Pagado</p>
                  <p className="text-2xl font-black text-[#00F0FF]">€{order.totalPrice}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-[#94A3B8] uppercase font-black">Método</p>
                  <p className="text-white font-bold">Subsonic Wallet</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full mt-8 py-4 rounded-2xl bg-gradient-to-r from-[#FF2A5F] to-[#00F0FF] text-white font-black uppercase tracking-widest hover:opacity-90 transition-all"
              >
                Cerrar Panel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};