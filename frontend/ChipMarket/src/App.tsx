import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UserProvider } from './context/UserContext';
import { AdminDashboard } from './pages/AdminDashboard';
import { CustomerShopPage } from './pages/Client/Home/CustomerShopPage';
import { CustomerProfilePage } from './pages/Client/Profile/CustomerProfilePage';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';

// Tipo para las vistas del cliente
type CustomerView = 'shop' | 'profile';

function AppContent() {
  const { user } = useAuth();
  const [customerView, setCustomerView] = useState<CustomerView>('shop');
  
  if (!user) {
    return <AuthPage />;
  }

  if (user.id_role === 1) {
    return <AdminDashboard />;
  }
  
  if (user.id_role === 2) {
    // Renderizar vista según el estado
    if (customerView === 'profile') {
      return <CustomerProfilePage onBack={() => setCustomerView('shop')} />;
    }
    return <CustomerShopPage onNavigateToProfile={() => setCustomerView('profile')} />;
  }

  return null;
    
  //return <ProfilePage />;
}

export default function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <AppContent />
      </UserProvider>
    </AuthProvider>
  );
}
