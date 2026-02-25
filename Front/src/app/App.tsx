import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { Navbar } from './components/Navbar';
import { Home } from './components/Home';
import { EventDetail } from './components/EventDetail';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { Menu } from './components/Menu';
import { Cart } from './components/Cart';
import { MyTickets } from './components/MyTickets';
import { MusicPlayer } from './components/MusicPlayer';
import { Merchandise } from './components/Merchandise';
import { FriendsRadar } from './components/FriendsRadar';
import { VendorMenu } from './components/vendor/VendorMenu';
import { SpacesSearch } from './components/vendor/SpacesSearch';
import { SpaceDetail } from './components/vendor/SpaceDetail';
import { VendorProfile } from './components/vendor/VendorProfile';
import { Profile } from './components/Profile';
import { Toaster } from 'sonner';
import { Admin } from './components/Admin';

const ProtectedRoute: React.FC<{ 
  children: React.ReactNode; 
  vendorOnly?: boolean;
  adminOnly?: boolean; // Añadimos esta prop opcional
}> = ({
  children,
  vendorOnly = false,
  adminOnly = false,
}) => {
  const { user } = useAuth();

  // 1. Si no hay usuario, al login
  if (!user) {
    return <Navigate to="/login" />;
  }

  // 2. Si la ruta es SOLO para Admin y el usuario no lo es
  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }

  // 3. Prioridad Admin: Si es admin, permitimos que vea cualquier cosa 
  // (O puedes redirigirlo a su panel si intenta entrar a rutas de usuario)
  if (user.role === 'admin') {
    return <>{children}</>;
  }

  // 4. Lógica para Vendors
  if (vendorOnly && user.role !== 'vendor') {
    return <Navigate to="/dashboard" />;
  }

  // 5. Si un vendor intenta entrar a rutas de cliente
  if (!vendorOnly && user.role === 'vendor') {
    return <Navigate to="/vendor/dashboard" />;
  }

  return <>{children}</>;
};

function AppContent() {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <Toaster position="top-right" richColors />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/event/:id" element={<EventDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* User Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Menu />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tickets"
          element={
            <ProtectedRoute>
              <MyTickets />
            </ProtectedRoute>
          }
        />
        <Route
          path="/music"
          element={
            <ProtectedRoute>
              <MusicPlayer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/merchandise"
          element={
            <ProtectedRoute>
              <Merchandise />
            </ProtectedRoute>
          }
        />
        <Route
          path="/friends-radar"
          element={
            <ProtectedRoute>
              <FriendsRadar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Vendor Protected Routes */}
        <Route
          path="/vendor/dashboard"
          element={
            <ProtectedRoute vendorOnly>
              <VendorMenu />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor/spaces"
          element={
            <ProtectedRoute vendorOnly>
              <SpacesSearch />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor/space/:id"
          element={
            <ProtectedRoute vendorOnly>
              <SpaceDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor/profile"
          element={
            <ProtectedRoute vendorOnly>
              <VendorProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor/my-spaces"
          element={
            <ProtectedRoute vendorOnly>
              <VendorMenu />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor/history"
          element={
            <ProtectedRoute vendorOnly>
              <VendorProfile />
            </ProtectedRoute>
          }
        />

        {/* Admin Route */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute vendorOnly>
              <Admin />
            </ProtectedRoute>
          }
        />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}
