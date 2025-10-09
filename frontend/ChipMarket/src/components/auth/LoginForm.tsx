import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <form onSubmit={handleSubmit}>
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
      <div style={{ marginBottom: '20px' }}>
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

      {/* Recordarme y Olvidaste contraseña */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '28px'
      }}>
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.6 : 1
        }}>
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            disabled={loading}
            style={{
              width: '18px',
              height: '18px',
              cursor: loading ? 'not-allowed' : 'pointer',
              accentColor: '#6366F1'
            }}
          />
          <span style={{
            fontSize: '14px',
            color: '#4B5563',
            fontWeight: '500',
            userSelect: 'none'
          }}>
            Recordarme
          </span>
        </label>
        <button
          type="button"
          disabled={loading}
          style={{
            fontSize: '14px',
            color: '#6366F1',
            fontWeight: '600',
            background: 'none',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            textDecoration: 'none',
            opacity: loading ? 0.6 : 1
          }}
          onMouseEnter={(e) => !loading && (e.currentTarget.style.textDecoration = 'underline')}
          onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
        >
          ¿Olvidaste tu contraseña?
        </button>
      </div>

      {/* Botón Iniciar Sesión */}
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
          marginBottom: '28px',
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
        {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
      </button>

      {/* Divider */}
      <div style={{
        position: 'relative',
        marginBottom: '24px',
        height: '1px'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          borderTop: '1px solid #E5E7EB'
        }}></div>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'white',
          padding: '0 16px'
        }}>
          <span style={{
            fontSize: '13px',
            color: '#6B7280',
            fontWeight: '500',
            whiteSpace: 'nowrap'
          }}>
            Conexión segura con JWT
          </span>
        </div>
      </div>

    </form>
  );
}