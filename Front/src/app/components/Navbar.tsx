import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { Music, ShoppingCart, User, LogOut, Home, Store, Radio } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router';

export const Navbar: React.FC = () => {
  const { user, logout, switchRole } = useAuth();
  const { getTotalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogoClick = () => {
    if (user) {
      navigate(user.role === 'vendor' ? '/vendor/dashboard' : '/dashboard');
    } else {
      navigate('/');
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

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

            {user && user.role === 'user' && (
              <div className="hidden md:flex space-x-1">
                <NavButton
                  icon={<Home className="w-4 h-4" />}
                  label="Dashboard"
                  onClick={() => navigate('/dashboard')}
                  active={isActive('/dashboard')}
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

            {user && user.role === 'vendor' && (
              <div className="hidden md:flex space-x-1">
                <NavButton
                  icon={<Home className="w-4 h-4" />}
                  label="Dashboard"
                  onClick={() => navigate('/vendor/dashboard')}
                  active={isActive('/vendor/dashboard')}
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
                <button
                  onClick={() => navigate(user.role === 'vendor' ? '/vendor/profile' : '/profile')}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 transition-colors"
                >
                  <User className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-purple-200">{user.name}</span>
                </button>

                <select
                  value={user.role || ''}
                  onChange={(e) => {
                    const newRole = e.target.value as 'user' | 'vendor';
                    switchRole(newRole);
                    navigate(newRole === 'vendor' ? '/vendor/dashboard' : '/dashboard');
                  }}
                  className="px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="user">Usuario</option>
                  <option value="vendor">Proveedor</option>
                </select>

                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors"
                >
                  <LogOut className="w-5 h-5 text-red-400" />
                </button>
              </div>
            )}

            {!user && (
              <div className="flex space-x-2">
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 rounded-lg bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white transition-colors"
                >
                  Register
                </button>
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
        ? 'bg-pink-500/20 text-pink-300'
        : 'text-gray-300 hover:bg-pink-500/10 hover:text-pink-400'
    }`}
  >
    {icon}
    <span className="text-sm">{label}</span>
  </button>
);
