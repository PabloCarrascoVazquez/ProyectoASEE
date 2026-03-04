import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router';
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
import { AdminPanel } from './components/AdminPanel';

const ProtectedRoute: React.FC<{ 
  children: React.ReactNode; 
  vendorOnly?: boolean;
  adminOnly?: boolean;
}> = ({
  children,
  vendorOnly = false,
  adminOnly = false,
}) => {
  const { user } = useAuth();
  const location = useLocation(); // Necesitas importar useLocation de 'react-router'

  // 1. Si no hay usuario, al login
  if (!user) {
    return <Navigate to="/login" />;
  }

  // 2. LÓGICA ESTRICTA: Si es admin y no está en /admin, lo mandamos allí
  // Esto evita que el admin navegue por el menú de usuarios o la tienda
  if (user.role === 'admin' && location.pathname !== '/admin') {
    return <Navigate to="/admin" replace />;
  }

  // 3. Si la ruta es SOLO para Admin y el usuario no lo es (por si acaso intenta entrar por URL)
  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/" />;
  }

  // 4. Lógica para Vendors (Permitimos que el admin también entre aquí si quieres)
  if (vendorOnly && user.role !== 'vendor' && user.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
};

function AppContent() {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <Toaster 
              theme="dark" 
              position="bottom-right" 
              richColors 
              closeButton
              expand={false}
      />
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
            <ProtectedRoute adminOnly={true}>
              <AdminPanel />
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
