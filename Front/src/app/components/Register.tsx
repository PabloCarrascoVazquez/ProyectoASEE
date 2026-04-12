import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { Music, User, Mail, Lock, Loader2, Github, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export const Register: React.FC = () => {
  // --- ESTADOS ---
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user' | 'vendor'>('user');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, loginWithOAuth } = useAuth();
  const navigate = useNavigate();

  // --- MANEJADORES ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación básica de seguridad
    if (!name || !email || !password) {
      toast.error('Todos los campos son obligatorios');
      return;
    }

    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsSubmitting(true);

    try {
      // Llamada al registro del AuthContext (que conecta con el backend Flask)
      await register(name, email, password);
      
      toast.success('¡Registro completado con éxito!');
      
      // Redirección lógica: si es vendor va a su panel, si no al menú
      // Nota: El backend debe estar preparado para guardar el 'role'
      navigate(role === 'vendor' ? '/vendor/menu' : '/menu');
    } catch (error: any) {
      toast.error(error.message || 'Error al crear la cuenta. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOAuthLogin = (provider: 'google' | 'github') => {
    loginWithOAuth(provider);
    toast.success(`Sincronizando con ${provider}...`);
    navigate('/menu');
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        {/* Logo y Título */}
        <div className="text-center mb-8">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity }}
          >
            <Music className="w-16 h-16 mx-auto mb-4 text-[#FF2A5F]" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl mb-2 bg-gradient-to-r from-[#FF2A5F] to-[#00F0FF] bg-clip-text text-transparent font-black uppercase tracking-tighter">
            Únete a la Red
          </h1>
          <p className="text-[#94A3B8] font-medium tracking-wide">Crea tu identidad Subsonic</p>
        </div>

        {/* Card de Formulario */}
        <div className="bg-[#1A2235] border border-[#FF2A5F]/30 rounded-3xl p-8 shadow-[0_0_50px_rgba(255,42,95,0.1)]">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Campo Nombre */}
            <div>
              <label className="block text-xs font-black text-[#94A3B8] uppercase tracking-[0.2em] mb-2 ml-1">
                Nombre de Usuario
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#FF2A5F] w-5 h-5" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Alex Raver"
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#0B0F19]/50 border border-[#FF2A5F]/20 text-[#F8FAFC] placeholder-[#475569] focus:outline-none focus:ring-2 focus:ring-[#FF2A5F]/50 transition-all"
                />
              </div>
            </div>

            {/* Campo Email */}
            <div>
              <label className="block text-xs font-black text-[#94A3B8] uppercase tracking-[0.2em] mb-2 ml-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#00F0FF] w-5 h-5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@frecuencia.com"
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#0B0F19]/50 border border-[#00F0FF]/20 text-[#F8FAFC] placeholder-[#475569] focus:outline-none focus:ring-2 focus:ring-[#00F0FF]/50 transition-all"
                />
              </div>
            </div>

            {/* Campo Password */}
            <div>
              <label className="block text-xs font-black text-[#94A3B8] uppercase tracking-[0.2em] mb-2 ml-1">
                Contraseña Segura
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#FF2A5F] w-5 h-5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#0B0F19]/50 border border-[#FF2A5F]/20 text-[#F8FAFC] placeholder-[#475569] focus:outline-none focus:ring-2 focus:ring-[#FF2A5F]/50 transition-all"
                />
              </div>
            </div>

            {/* Selector de Rol */}
            <div>
              <label className="block text-xs font-black text-[#94A3B8] uppercase tracking-[0.2em] mb-2 ml-1">
                Tipo de Acceso
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'user' | 'vendor')}
                className="w-full px-4 py-3 rounded-xl bg-[#0B0F19]/80 border border-white/10 text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#00F0FF]/50 transition-all cursor-pointer appearance-none"
              >
                <option value="user">USER - Comprar y Disfrutar</option>
                <option value="vendor">VENDOR - Gestionar Espacios</option>
              </select>
            </div>

            {/* Botón de Envío */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full group relative py-4 rounded-xl bg-gradient-to-r from-[#FF2A5F] to-[#00F0FF] text-[#F8FAFC] font-black uppercase tracking-widest overflow-hidden transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            >
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <div className="relative flex items-center justify-center space-x-2">
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Iniciando Protocolo...</span>
                  </>
                ) : (
                  <>
                    <span>Generar Acceso</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
            </button>
          </form>

          {/* Divisor Social */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5" />
              </div>
              <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.3em]">
                <span className="px-4 bg-[#1A2235] text-[#475569]">Fast Login</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <button
                onClick={() => handleOAuthLogin('google')}
                className="flex items-center justify-center space-x-2 py-3 rounded-xl bg-[#0B0F19]/30 border border-white/5 hover:border-[#FF2A5F]/40 text-[#F8FAFC] transition-all hover:bg-[#FF2A5F]/5"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span className="text-xs font-bold uppercase">Google</span>
              </button>

              <button
                onClick={() => handleOAuthLogin('github')}
                className="flex items-center justify-center space-x-2 py-3 rounded-xl bg-[#0B0F19]/30 border border-white/5 hover:border-[#00F0FF]/40 text-[#F8FAFC] transition-all hover:bg-[#00F0FF]/5"
              >
                <Github className="w-5 h-5" />
                <span className="text-xs font-bold uppercase">GitHub</span>
              </button>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-[#94A3B8] text-sm">
              ¿Ya eres parte de la frecuencia?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-[#FF2A5F] font-bold hover:underline ml-1"
              >
                Inicia Sesión
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};