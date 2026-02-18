import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, MapPin } from 'lucide-react';
import { motion } from 'motion/react';

export const Profile: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-950 to-black">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl mb-2 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
            Mi Perfil
          </h1>
          <p className="text-xl text-gray-400">Información de tu cuenta</p>
        </motion.div>

        <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-pink-500/30 rounded-2xl p-8">
          <div className="flex items-center space-x-6 mb-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-white text-3xl">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl text-white mb-1">{user.name}</h2>
              <p className="text-gray-400 capitalize">{user.role === 'user' ? 'Usuario' : 'Proveedor'}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Mail className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Email</p>
                <p className="text-white">{user.email}</p>
              </div>
            </div>

            {user.address && (
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-lg bg-pink-500/20 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-pink-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Dirección</p>
                  <p className="text-white">{user.address}</p>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <User className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">ID de Usuario</p>
                <p className="text-white font-mono">{user.id}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
