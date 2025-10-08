// src/pages/ProfilePage.tsx
import React from 'react';
import { User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/common/Alert';

export default function ProfilePage() {
  const { user, token, loading, message, getProfile, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-6">
          <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800">¡Bienvenido!</h2>
          <p className="text-gray-600 mt-2">Has iniciado sesión correctamente</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">Información del Usuario</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Nombre</p>
              <p className="font-medium text-gray-800">{user?.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium text-gray-800">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Rol</p>
              <p className="font-medium text-gray-800">
                {user?.id_role === 1 ? 'Administrador' : 'Usuario'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">ID</p>
              <p className="font-medium text-gray-800">{user?.id}</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-xl p-4 mb-6">
          <p className="text-sm text-gray-600 font-mono break-all">
            <span className="font-semibold">Token:</span> {token.substring(0, 50)}...
          </p>
        </div>

        {message && <Alert type={message.type} message={message.text} />}

        <div className="space-y-3">
          <button
            onClick={getProfile}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition disabled:opacity-50"
          >
            {loading ? 'Cargando...' : 'Refrescar Perfil'}
          </button>
          <button
            onClick={logout}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-medium transition"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
}