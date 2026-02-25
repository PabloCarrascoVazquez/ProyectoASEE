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
      navigate(user.role === 'vendor' ? '/vendor/menu' : '/menu');
    } else {
      navigate('/');
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-[#0B0F19] border-b border-[#FF2A5F]/30 sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <button onClick={handleLogoClick} className="flex items-center space-x-2 group">
              <Music className="w-8 h-8 text-[#FF2A5F] group-hover:text-[#FF2A5F]/80 transition-colors" />
              <span className="text-xl font-bold bg-gradient-to-r from-[#FF2A5F] to-[#00F0FF] bg-clip-text text-transparent">
                SUBSONIC
              </span>
            </button>

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
                className="relative p-2 rounded-lg bg-[#FF2A5F]/10 hover:bg-[#FF2A5F]/20 transition-colors"
              >
                <ShoppingCart className="w-5 h-5 text-[#FF2A5F]" />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#FF2A5F] text-[#F8FAFC] text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </button>
            )}

            {user && (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => navigate(user.role === 'vendor' ? '/vendor/profile' : '/profile')}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-[#00F0FF]/10 hover:bg-[#00F0FF]/20 transition-colors"
                >
                  <User className="w-4 h-4 text-[#00F0FF]" />
                  <span className="text-sm text-[#00F0FF]/80">{user.name}</span>
                </button>

                <select
                  value={user.role || ''}
                  onChange={(e) => {
                    const newRole = e.target.value as 'user' | 'vendor';
                    switchRole(newRole);
                    navigate(newRole === 'vendor' ? '/vendor/menu' : '/menu');
                  }}
                  className="px-3 py-2 rounded-lg bg-[#00F0FF]/10 border border-[#00F0FF]/30 text-[#00F0FF]/80 text-sm focus:outline-none focus:ring-2 focus:ring-[#00F0FF]/50"
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
                  className="px-4 py-2 rounded-lg bg-[#FF2A5F]/10 hover:bg-[#FF2A5F]/20 text-[#FF2A5F] transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#FF2A5F] to-[#00F0FF] hover:from-[#E62555] hover:to-[#00D8E6] text-[#F8FAFC] transition-colors"
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
        ? 'bg-[#FF2A5F]/20 text-[#FF2A5F]/80'
        : 'text-[#94A3B8] hover:bg-[#FF2A5F]/10 hover:text-[#FF2A5F]'
    }`}
  >
    {icon}
    <span className="text-sm">{label}</span>
  </button>
);
