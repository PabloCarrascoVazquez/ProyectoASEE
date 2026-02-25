import React from 'react';
import { useNavigate } from 'react-router';
import { useCart } from '../contexts/CartContext';
import { ShoppingCart, Trash2, Plus, Minus, CreditCard } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export const Cart: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, getTotalPrice, checkout } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error('El carrito está vacío');
      return;
    }
    checkout();
    toast.success('¡Compra realizada con éxito!');
    navigate('/tickets');
  };

  return (
    <div className="min-h-screen bg-[#0B0F19]">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl mb-2 bg-gradient-to-r from-[#FF2A5F] to-[#00F0FF] bg-clip-text text-transparent">
            Carrito de Compras
          </h1>
          <p className="text-xl text-[#94A3B8]">
            {cart.length} producto{cart.length !== 1 ? 's' : ''} en tu carrito
          </p>
        </motion.div>

        {cart.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingCart className="w-24 h-24 mx-auto mb-6 text-[#94A3B8]/60" />
            <h2 className="text-2xl mb-4 text-[#F8FAFC]">Tu carrito está vacío</h2>
            <p className="text-[#94A3B8] mb-8">Añade algunos productos para continuar</p>
            <button
              onClick={() => navigate('/menu')}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#FF2A5F] to-[#00F0FF] hover:from-[#E62555] hover:to-[#00D8E6] text-[#F8FAFC] transition-all"
            >
              Ir al Menú
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-[#1A2235] border border-[#FF2A5F]/30 rounded-2xl p-6"
                >
                  <div className="flex items-start space-x-4">
                    {item.image && (
                      <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="flex-1">
                      <h3 className="text-lg text-[#F8FAFC] mb-1">{item.name}</h3>
                      <p className="text-sm text-[#94A3B8] mb-3">
                        {item.type === 'ticket' ? 'Entrada' : 'Merchandising'}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 rounded-lg bg-[#00F0FF]/20 hover:bg-[#00F0FF]/30 flex items-center justify-center transition-colors"
                          >
                            <Minus className="w-4 h-4 text-[#00F0FF]" />
                          </button>
                          <span className="text-[#F8FAFC] w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 rounded-lg bg-[#00F0FF]/20 hover:bg-[#00F0FF]/30 flex items-center justify-center transition-colors"
                          >
                            <Plus className="w-4 h-4 text-[#00F0FF]" />
                          </button>
                        </div>

                        <div className="flex items-center space-x-4">
                          <span className="text-xl text-[#FF2A5F]">
                            €{(item.price * item.quantity).toFixed(2)}
                          </span>
                          <button
                            onClick={() => {
                              removeFromCart(item.id);
                              toast.success('Producto eliminado del carrito');
                            }}
                            className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors"
                          >
                            <Trash2 className="w-5 h-5 text-red-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="sticky top-24 bg-[#1A2235] border border-[#FF2A5F]/30 rounded-2xl p-6"
              >
                <h2 className="text-2xl mb-6 text-[#F8FAFC]">Resumen</h2>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between text-[#94A3B8]">
                    <span>Subtotal</span>
                    <span>€{getTotalPrice().toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[#94A3B8]">
                    <span>Gastos de gestión</span>
                    <span>€{(getTotalPrice() * 0.05).toFixed(2)}</span>
                  </div>
                  <div className="border-t border-[#0B0F19] pt-4">
                    <div className="flex items-center justify-between text-[#F8FAFC] text-xl">
                      <span>Total</span>
                      <span className="text-[#FF2A5F]">
                        €{(getTotalPrice() * 1.05).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-[#FF2A5F] to-[#00F0FF] hover:from-[#E62555] hover:to-[#00D8E6] text-[#F8FAFC] transition-all flex items-center justify-center space-x-2"
                >
                  <CreditCard className="w-5 h-5" />
                  <span>Proceder al Pago</span>
                </button>

                <div className="mt-6 p-4 rounded-xl bg-[#0B0F19]/50 border border-[#00F0FF]/30">
                  <p className="text-xs text-[#94A3B8] text-center">
                    Métodos de pago aceptados: Tarjeta de crédito, PayPal, Bizum
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
