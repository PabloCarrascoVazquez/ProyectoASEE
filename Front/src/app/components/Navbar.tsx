import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { Music, ShoppingCart, User, LogOut, Home, Store, Radio, ShieldCheck } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router';

export const Navbar: React.FC = () => {
  const { user, logout, switchRole } = useAuth();
  const { getTotalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogoClick = () => {
    if (user) {
      if (user.role === 'admin') navigate('/admin');
      else navigate(user.role === 'vendor' ? '/vendor/menu' : '/menu');
    } else {
      navigate('/');
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-gradient-to-r from-purple-900 via-pink-900 to-purple-900 border-b border-pink-500/30 sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <button onClick={handleLogoClick} className="flex items-center space-x-2 group">
              <Music className="w-8 h-8 text-pink-400 group-hover:text-pink-300 transition-colors" />
              <span className="text-xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                SUBSONIC
              </span>
            </button>

            {/* SECCIÓN LINKS ADMIN */}
            {user && user.role === 'admin' && (
              <div className="hidden md:flex space-x-1">
                <NavButton
                  icon={<ShieldCheck className="w-4 h-4" />}
                  label="Panel de Gestión"
                  onClick={() => navigate('/admin')}
                  active={isActive('/admin')}
                />
              </div>
            )}

            {/* SECCIÓN LINKS USUARIO */}
            {user && user.role === 'user' && (
              <div className="hidden md:flex space-x-1">
                <NavButton
                  icon={<Home className="w-4 h-4" />}
                  label="Menu"
                  onClick={() => navigate('/menu')}
                  active={isActive('/menu')}
                />
                <NavButton
                  icon={<Radio className="w-4 h-4" />}
                  label="Music"
                  onClick={() => navigate('/music')}
                  active={isActive('/music')}
                />
                <NavButton
                  icon={<Store className="w-4 h-4" />}
                  label="Merch"
                  onClick={() => navigate('/merchandise')}
                  active={isActive('/merchandise')}
                />
              </div>
            )}

            {/* SECCIÓN LINKS VENDOR */}
            {user && user.role === 'vendor' && (
              <div className="hidden md:flex space-x-1">
                <NavButton
                  icon={<Home className="w-4 h-4" />}
                  label="Menu"
                  onClick={() => navigate('/vendor/menu')}
                  active={isActive('/vendor/menu')}
                />
                <NavButton
                  icon={<Store className="w-4 h-4" />}
                  label="Spaces"
                  onClick={() => navigate('/vendor/spaces')}
                  active={isActive('/vendor/spaces')}
                />
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {user && user.role === 'user' && (
              <button
                onClick={() => navigate('/cart')}
                className="relative p-2 rounded-lg bg-pink-500/10 hover:bg-pink-500/20 transition-colors"
              >
                <ShoppingCart className="w-5 h-5 text-pink-400" />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </button>
            )}

            {user && (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <User className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-purple-200 font-medium">
                    {user.role === 'admin' ? 'ADMINISTRADOR' : user.name}
                  </span>
                </div>

                {user.role !== 'admin' && (
                  <select
                    value={user.role || ''}
                    onChange={(e) => {
                      const newRole = e.target.value as 'user' | 'vendor';
                      switchRole(newRole);
                      navigate(newRole === 'vendor' ? '/vendor/menu' : '/menu');
                    }}
                    className="px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-200 text-sm focus:outline-none cursor-pointer"
                  >
                    <option value="user">Usuario</option>
                    <option value="vendor">Proveedor</option>
                  </select>
                )}

                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors group"
                >
                  <LogOut className="w-5 h-5 text-red-400 group-hover:text-red-300" />
                </button>
              </div>
            )}

            {!user && (
              <div className="flex space-x-2">
                <button onClick={() => navigate('/login')} className="px-4 py-2 rounded-lg bg-pink-500/10 text-pink-400">Login</button>
                <button onClick={() => navigate('/register')} className="px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 text-white">Register</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

const NavButton: React.FC<{
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
}> = ({ icon, label, onClick, active }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
      active
        ? 'bg-pink-500/30 text-white border border-pink-500/50'
        : 'text-gray-300 hover:bg-pink-500/10 hover:text-pink-400'
    }`}
  >
    {icon}
    <span className="text-sm font-medium">{label}</span>
  </button>
);