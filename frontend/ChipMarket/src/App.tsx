import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AdminDashboard } from './pages/AdminDashboard';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';

function AppContent() {
  const { user } = useAuth();
  
  if (!user) {
    return <AuthPage />;
  }

  if (user.id_role === 1) {
    return <AdminDashboard />;
  }

  return <ProfilePage />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
