import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, MapPin } from 'lucide-react';
import { motion } from 'motion/react';

export const Profile: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0B0F19]">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl mb-2 bg-gradient-to-r from-[#FF2A5F] to-[#00F0FF] bg-clip-text text-transparent">
            Mi Perfil
          </h1>
          <p className="text-xl text-[#94A3B8]">Información de tu cuenta</p>
        </motion.div>

        <div className="bg-[#1A2235] border border-[#FF2A5F]/30 rounded-2xl p-8">
          <div className="flex items-center space-x-6 mb-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#FF2A5F] to-[#00F0FF] flex items-center justify-center text-[#F8FAFC] text-3xl">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl text-[#F8FAFC] mb-1">{user.name}</h2>
              <p className="text-[#94A3B8] capitalize">{user.role === 'user' ? 'Usuario' : 'Proveedor'}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-lg bg-[#00F0FF]/20 flex items-center justify-center">
                <Mail className="w-6 h-6 text-[#00F0FF]" />
              </div>
              <div>
                <p className="text-sm text-[#94A3B8]">Email</p>
                <p className="text-[#F8FAFC]">{user.email}</p>
              </div>
            </div>

            {user.address && (
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-lg bg-[#FF2A5F]/20 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-[#FF2A5F]" />
                </div>
                <div>
                  <p className="text-sm text-[#94A3B8]">Dirección</p>
                  <p className="text-[#F8FAFC]">{user.address}</p>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-lg bg-[#00F0FF]/20 flex items-center justify-center">
                <User className="w-6 h-6 text-[#00F0FF]" />
              </div>
              <div>
                <p className="text-sm text-[#94A3B8]">ID de Usuario</p>
                <p className="text-[#F8FAFC] font-mono">{user.id}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
