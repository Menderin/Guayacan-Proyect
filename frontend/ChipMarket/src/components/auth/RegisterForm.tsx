import { useState } from 'react';
import { Eye, EyeOff, User, Mail, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await register(name, email, password);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Campo Nombre */}
      <div style={{ marginBottom: '24px' }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '600',
          color: '#374151',
          marginBottom: '10px'
        }}>
          Nombre Completo
        </label>
        <div style={{ position: 'relative' }}>
          <User style={{
            position: 'absolute',
            left: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '20px',
            height: '20px',
            color: '#9CA3AF',
            pointerEvents: 'none'
          }} />
          <input
            type="text"
            placeholder="Juan Pérez"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            minLength={3}
            maxLength={100}
            style={{
              width: '100%',
              paddingLeft: '48px',
              paddingRight: '16px',
              paddingTop: '16px',
              paddingBottom: '16px',
              fontSize: '15px',
              border: '2px solid #E5E7EB',
              borderRadius: '12px',
              outline: 'none',
              transition: 'all 0.2s',
              boxSizing: 'border-box',
              backgroundColor: loading ? '#F9FAFB' : 'white',
              cursor: loading ? 'not-allowed' : 'text'
            }}
            onFocus={(e) => {
              if (!loading) {
                e.target.style.borderColor = '#6366F1';
                e.target.style.boxShadow = '0 0 0 4px rgba(99, 102, 241, 0.1)';
              }
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#E5E7EB';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>
      </div>

      {/* Campo Email */}
      <div style={{ marginBottom: '24px' }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '600',
          color: '#374151',
          marginBottom: '10px'
        }}>
          Correo Electrónico
        </label>
        <div style={{ position: 'relative' }}>
          <Mail style={{
            position: 'absolute',
            left: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '20px',
            height: '20px',
            color: '#9CA3AF',
            pointerEvents: 'none'
          }} />
          <input
            type="email"
            placeholder="tu@email.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            style={{
              width: '100%',
              paddingLeft: '48px',
              paddingRight: '16px',
              paddingTop: '16px',
              paddingBottom: '16px',
              fontSize: '15px',
              border: '2px solid #E5E7EB',
              borderRadius: '12px',
              outline: 'none',
              transition: 'all 0.2s',
              boxSizing: 'border-box',
              backgroundColor: loading ? '#F9FAFB' : 'white',
              cursor: loading ? 'not-allowed' : 'text'
            }}
            onFocus={(e) => {
              if (!loading) {
                e.target.style.borderColor = '#6366F1';
                e.target.style.boxShadow = '0 0 0 4px rgba(99, 102, 241, 0.1)';
              }
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#E5E7EB';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>
      </div>

      {/* Campo Contraseña */}
      <div style={{ marginBottom: '12px' }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '600',
          color: '#374151',
          marginBottom: '10px'
        }}>
          Contraseña
        </label>
        <div style={{ position: 'relative' }}>
          <Lock style={{
            position: 'absolute',
            left: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '20px',
            height: '20px',
            color: '#9CA3AF',
            pointerEvents: 'none'
          }} />
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            minLength={8}
            style={{
              width: '100%',
              paddingLeft: '48px',
              paddingRight: '56px',
              paddingTop: '16px',
              paddingBottom: '16px',
              fontSize: '15px',
              border: '2px solid #E5E7EB',
              borderRadius: '12px',
              outline: 'none',
              transition: 'all 0.2s',
              boxSizing: 'border-box',
              backgroundColor: loading ? '#F9FAFB' : 'white',
              cursor: loading ? 'not-allowed' : 'text'
            }}
            onFocus={(e) => {
              if (!loading) {
                e.target.style.borderColor = '#6366F1';
                e.target.style.boxShadow = '0 0 0 4px rgba(99, 102, 241, 0.1)';
              }
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#E5E7EB';
              e.target.style.boxShadow = 'none';
            }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={loading}
            style={{
              position: 'absolute',
              right: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              color: '#9CA3AF',
              transition: 'all 0.2s',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              borderRadius: '6px'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.color = '#6366F1';
                e.currentTarget.style.backgroundColor = '#F3F4F6';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#9CA3AF';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            {showPassword ? <EyeOff style={{ width: '20px', height: '20px' }} /> : <Eye style={{ width: '20px', height: '20px' }} />}
          </button>
        </div>
      </div>

      {/* Ayuda de contraseña */}
      <div style={{ marginBottom: '32px' }}>
        <p style={{
          fontSize: '12px',
          color: '#6B7280',
          margin: 0,
          lineHeight: '1.5'
        }}>
          Mínimo 8 caracteres, 1 mayúscula, 1 minúscula y 1 número
        </p>
      </div>

      {/* Botón Crear Cuenta */}
      <button
        type="submit"
        disabled={loading}
        style={{
          width: '100%',
          padding: '16px 24px',
          fontSize: '16px',
          fontWeight: '600',
          color: 'white',
          background: loading 
            ? 'linear-gradient(to right, #9CA3AF, #D1D5DB)' 
            : 'linear-gradient(to right, #6366F1, #A855F7)',
          border: 'none',
          borderRadius: '12px',
          cursor: loading ? 'not-allowed' : 'pointer',
          boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
          transition: 'all 0.2s',
          opacity: loading ? 0.7 : 1
        }}
        onMouseEnter={(e) => {
          if (!loading) {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(99, 102, 241, 0.4)';
          }
        }}
        onMouseLeave={(e) => {
          if (!loading) {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.3)';
          }
        }}
      >
        {loading ? 'Registrando...' : 'Crear Cuenta'}
      </button>
    </form>
  );
}