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
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-950 to-black">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl mb-2 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
            Carrito de Compras
          </h1>
          <p className="text-xl text-gray-400">
            {cart.length} producto{cart.length !== 1 ? 's' : ''} en tu carrito
          </p>
        </motion.div>

        {cart.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingCart className="w-24 h-24 mx-auto mb-6 text-gray-600" />
            <h2 className="text-2xl mb-4 text-white">Tu carrito está vacío</h2>
            <p className="text-gray-400 mb-8">Añade algunos productos para continuar</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white transition-all"
            >
              Ir al Dashboard
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
                  className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-pink-500/30 rounded-2xl p-6"
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
                      <h3 className="text-lg text-white mb-1">{item.name}</h3>
                      <p className="text-sm text-gray-400 mb-3">
                        {item.type === 'ticket' ? 'Entrada' : 'Merchandising'}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 flex items-center justify-center transition-colors"
                          >
                            <Minus className="w-4 h-4 text-purple-400" />
                          </button>
                          <span className="text-white w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 flex items-center justify-center transition-colors"
                          >
                            <Plus className="w-4 h-4 text-purple-400" />
                          </button>
                        </div>

                        <div className="flex items-center space-x-4">
                          <span className="text-xl text-pink-400">
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
                className="sticky top-24 bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-pink-500/30 rounded-2xl p-6"
              >
                <h2 className="text-2xl mb-6 text-white">Resumen</h2>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between text-gray-300">
                    <span>Subtotal</span>
                    <span>€{getTotalPrice().toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-300">
                    <span>Gastos de gestión</span>
                    <span>€{(getTotalPrice() * 0.05).toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-700 pt-4">
                    <div className="flex items-center justify-between text-white text-xl">
                      <span>Total</span>
                      <span className="text-pink-400">
                        €{(getTotalPrice() * 1.05).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white transition-all flex items-center justify-center space-x-2"
                >
                  <CreditCard className="w-5 h-5" />
                  <span>Proceder al Pago</span>
                </button>

                <div className="mt-6 p-4 rounded-xl bg-purple-900/30 border border-purple-500/30">
                  <p className="text-xs text-gray-400 text-center">
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
