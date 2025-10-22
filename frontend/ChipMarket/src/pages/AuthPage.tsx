import { useState } from 'react';
import { Cpu, Shield, Check } from 'lucide-react';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F8FAFC',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decoración de fondo */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        right: '-5%',
        width: '600px',
        height: '600px',
        background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
        borderRadius: '50%',
        opacity: '0.08',
        zIndex: 0
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-15%',
        left: '-10%',
        width: '700px',
        height: '700px',
        background: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)',
        borderRadius: '50%',
        opacity: '0.06',
        zIndex: 0
      }} />
      <div style={{
        display: 'flex',
        gap: '80px',
        maxWidth: '1200px',
        width: '100%',
        alignItems: 'center',
        flexWrap: 'wrap',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Hero Section - Izquierda */}
        <div style={{
          flex: '1',
          maxWidth: '500px',
          minWidth: '300px'
        }} className="hidden-mobile">
          {/* Logo y título */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '40px'
          }}>
            <div style={{
              background: '#2563EB',
              padding: '16px',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 30px rgba(37, 99, 235, 0.3)'
            }}>
              <Cpu style={{ width: '48px', height: '48px', color: 'white' }} />
            </div>
            <div>
              <h1 style={{
                fontSize: '42px',
                fontWeight: '700',
                margin: 0,
                lineHeight: '1.2',
                color: '#1E293B',
                letterSpacing: '-0.02em'
              }}>ChipMarket</h1>
              <p style={{
                fontSize: '18px',
                margin: 0,
                color: '#64748B',
                fontWeight: '500'
              }}>Tu tienda de PC Gaming</p>
            </div>
          </div>

          <p style={{
            fontSize: '22px',
            marginBottom: '40px',
            color: '#1E293B',
            lineHeight: '1.5',
            fontWeight: '600'
          }}>
            Tu próxima PC gaming está aquí
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{
                background: '#EFF6FF',
                padding: '10px',
                borderRadius: '12px',
                marginTop: '4px'
              }}>
                <Shield style={{ width: '24px', height: '24px', color: '#2563EB' }} />
              </div>
              <div>
                <h3 style={{
                  fontWeight: '600',
                  fontSize: '18px',
                  margin: '0 0 6px 0',
                  color: '#1E293B'
                }}>Compra segura y protegida</h3>
                <p style={{
                  margin: 0,
                  color: '#64748B',
                  fontSize: '15px'
                }}>Tus datos y pagos siempre protegidos</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{
                background: '#EFF6FF',
                padding: '10px',
                borderRadius: '12px',
                marginTop: '4px'
              }}>
                <Cpu style={{ width: '24px', height: '24px', color: '#2563EB' }} />
              </div>
              <div>
                <h3 style={{
                  fontWeight: '600',
                  fontSize: '18px',
                  margin: '0 0 6px 0',
                  color: '#1E293B'
                }}>PCs gaming de alto rendimiento</h3>
                <p style={{
                  margin: 0,
                  color: '#64748B',
                  fontSize: '15px'
                }}>Equipos optimizados para gaming profesional</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{
                background: '#EFF6FF',
                padding: '10px',
                borderRadius: '12px',
                marginTop: '4px'
              }}>
                <Check style={{ width: '24px', height: '24px', color: '#2563EB' }} />
              </div>
              <div>
                <h3 style={{
                  fontWeight: '600',
                  fontSize: '18px',
                  margin: '0 0 6px 0',
                  color: '#1E293B'
                }}>Stock actualizado en tiempo real</h3>
                <p style={{
                  margin: 0,
                  color: '#64748B',
                  fontSize: '15px'
                }}>Ve disponibilidad y precios al instante</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Section - Derecha */}
        <div style={{ width: '100%', maxWidth: '480px' }}>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08), 0 0 1px rgba(0, 0, 0, 0.1)',
            padding: '48px',
            border: '1px solid #E2E8F0'
          }}>
            {/* Logo mobile */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              marginBottom: '32px'
            }} className="mobile-only">
              <Cpu style={{ width: '32px', height: '32px', color: '#2563EB' }} />
              <h1 style={{
                fontSize: '28px',
                fontWeight: '700',
                color: '#1F2937',
                margin: 0
              }}>ChipMarket</h1>
            </div>

            {/* Tabs */}
            <div style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '32px',
              background: '#F1F5F9',
              padding: '6px',
              borderRadius: '14px'
            }}>
              <button
                onClick={() => setActiveTab('login')}
                style={{
                  flex: 1,
                  padding: '14px 16px',
                  borderRadius: '10px',
                  fontWeight: '600',
                  fontSize: '15px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: activeTab === 'login' ? '#2563EB' : 'transparent',
                  color: activeTab === 'login' ? 'white' : '#6B7280',
                  boxShadow: activeTab === 'login' ? '0 2px 8px rgba(37, 99, 235, 0.3)' : 'none'
                }}
              >
                Iniciar Sesión
              </button>
              <button
                onClick={() => setActiveTab('register')}
                style={{
                  flex: 1,
                  padding: '14px 16px',
                  borderRadius: '10px',
                  fontWeight: '600',
                  fontSize: '15px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: activeTab === 'register' ? '#2563EB' : 'transparent',
                  color: activeTab === 'register' ? 'white' : '#6B7280',
                  boxShadow: activeTab === 'register' ? '0 2px 8px rgba(37, 99, 235, 0.3)' : 'none'
                }}
              >
                Registrarse
              </button>
            </div>

            {/* Renderizar formularios */}
            {activeTab === 'login' ? <LoginForm /> : <RegisterForm />}
          </div>

          {/* Footer */}
          <p style={{
            textAlign: 'center',
            color: '#64748B',
            fontSize: '14px',
            marginTop: '24px',
            fontWeight: '500'
          }}>
            © 2025 ChipMarket Project - Desarrollado con ❤️
          </p>
        </div>
      </div>

      {/* CSS para responsive */}
      <style>{`
        @media (max-width: 1024px) {
          .hidden-mobile {
            display: none !important;
          }
          .mobile-only {
            display: flex !important;
          }
        }
        @media (min-width: 1025px) {
          .mobile-only {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}