import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/userService'; // Importamos el nuevo servicio
import { Music, Mail, Lock, Github, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // Estado para feedback visual
  
  const { setUser } = useAuth(); // Usamos setUser del contexto para actualizar el estado global
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    
    try {
      // 1. Llamada al servicio que conecta con Python/Flask
      const response = await userService.login(email, password);

      // 2. Actualizamos el estado global del usuario en el AuthContext
      // response contiene { token, user: { id, name, role } }
      setUser(response.user);
      
      toast.success(`¡Bienvenido de nuevo, ${response.user.name}!`);

      // 3. Redirección lógica basada en el rol que viene del Backend
      if (response.user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        // Redirigimos al dashboard o al menú según tu estructura
        navigate('/dashboard', { replace: true });
      }

    } catch (error: any) {
      // Manejo de errores (Credenciales incorrectas, etc.)
      toast.error(error.message || 'Error al iniciar sesión. Revisa tus credenciales.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOAuthLogin = (provider: 'google' | 'github') => {
    // Aquí iría la lógica de redirección a la API de OAuth si la implementas
    toast.info(`El login con ${provider} está en modo demostración.`);
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-8">
          <Music className="w-16 h-16 mx-auto mb-4 text-[#FF2A5F]" />
          <h1 className="text-4xl mb-2 bg-gradient-to-r from-[#FF2A5F] to-[#00F0FF] bg-clip-text text-transparent font-black tracking-tighter uppercase">
            Iniciar Sesión
          </h1>
          <p className="text-[#94A3B8]">Accede al ecosistema Subsonic</p>
        </div>

        <div className="bg-[#1A2235] border border-[#FF2A5F]/30 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm text-[#94A3B8] mb-2 font-bold uppercase tracking-widest">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#94A3B8] w-5 h-5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#0B0F19]/50 border border-[#FF2A5F]/30 text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#FF2A5F]/50 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-[#94A3B8] mb-2 font-bold uppercase tracking-widest">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#94A3B8] w-5 h-5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#0B0F19]/50 border border-[#FF2A5F]/30 text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#FF2A5F]/50 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-[#FF2A5F] to-[#00F0FF] hover:from-[#E62555] hover:to-[#00D8E6] text-[#F8FAFC] font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Verificando...</span>
                </>
              ) : (
                <span>Entrar al Sistema</span>
              )}
            </button>
          </form>

          {/* ... El resto de OAuth se mantiene igual ... */}
        </div>
      </motion.div>
    </div>
  );
};