import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UserProvider } from './context/UserContext';
import { AdminDashboard } from './pages/AdminDashboard';
import { CustomerShopPage } from './pages/Client/Home/CustomerShopPage';
import AuthPage from './pages/AuthPage';
//import ProfilePage from './pages/ProfilePage';

function AppContent() {
  const { user } = useAuth();
  
  if (!user) {
    return <AuthPage />;
  }

  if (user.id_role === 1) {
    return <AdminDashboard />;
  }

  if (user.id_role === 2) {
    return <CustomerShopPage />;
  }
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
