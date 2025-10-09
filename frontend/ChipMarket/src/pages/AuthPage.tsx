import { useState } from 'react';
import { Cpu, Shield, Check } from 'lucide-react';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        display: 'flex',
        gap: '60px',
        maxWidth: '1400px',
        width: '100%',
        alignItems: 'center',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        {/* Hero Section - Izquierda */}
        <div style={{
          flex: '1',
          color: 'white',
          maxWidth: '600px',
          minWidth: '300px'
        }} className="hidden-mobile">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '32px'
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              padding: '12px',
              borderRadius: '16px'
            }}>
              <Cpu style={{ width: '40px', height: '40px' }} />
            </div>
            <div>
              <h1 style={{
                fontSize: '48px',
                fontWeight: '700',
                margin: 0,
                lineHeight: '1.2'
              }}>ChipMarket</h1>
              <p style={{
                fontSize: '20px',
                margin: 0,
                opacity: 0.9
              }}>Tu tienda de PC Gaming</p>
            </div>
          </div>

          <p style={{
            fontSize: '22px',
            marginBottom: '40px',
            opacity: 0.95,
            lineHeight: '1.5'
          }}>
            Gestiona tu negocio con tecnología de vanguardia
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.2)',
                padding: '10px',
                borderRadius: '12px',
                marginTop: '4px'
              }}>
                <Shield style={{ width: '24px', height: '24px' }} />
              </div>
              <div>
                <h3 style={{
                  fontWeight: '600',
                  fontSize: '18px',
                  margin: '0 0 6px 0'
                }}>Conexión segura con JWT</h3>
                <p style={{
                  margin: 0,
                  opacity: 0.8,
                  fontSize: '15px'
                }}>Autenticación de nivel empresarial</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.2)',
                padding: '10px',
                borderRadius: '12px',
                marginTop: '4px'
              }}>
                <Cpu style={{ width: '24px', height: '24px' }} />
              </div>
              <div>
                <h3 style={{
                  fontWeight: '600',
                  fontSize: '18px',
                  margin: '0 0 6px 0'
                }}>Gestión de productos en tiempo real</h3>
                <p style={{
                  margin: 0,
                  opacity: 0.8,
                  fontSize: '15px'
                }}>Actualiza tu inventario al instante</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.2)',
                padding: '10px',
                borderRadius: '12px',
                marginTop: '4px'
              }}>
                <Check style={{ width: '24px', height: '24px' }} />
              </div>
              <div>
                <h3 style={{
                  fontWeight: '600',
                  fontSize: '18px',
                  margin: '0 0 6px 0'
                }}>Catálogo completo de componentes</h3>
                <p style={{
                  margin: 0,
                  opacity: 0.8,
                  fontSize: '15px'
                }}>Miles de productos al alcance de tu mano</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Section - Derecha */}
        <div style={{ width: '100%', maxWidth: '520px' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.3)',
            padding: '40px'
          }}>
            {/* Logo mobile */}
            <div style={{
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              marginBottom: '32px'
            }} className="mobile-only">
              <Cpu style={{ width: '32px', height: '32px', color: '#6366F1' }} />
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
              background: '#F3F4F6',
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
                  background: activeTab === 'login' ? 'white' : 'transparent',
                  color: activeTab === 'login' ? '#6366F1' : '#6B7280',
                  boxShadow: activeTab === 'login' ? '0 2px 8px rgba(0, 0, 0, 0.1)' : 'none'
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
                  background: activeTab === 'register' ? 'white' : 'transparent',
                  color: activeTab === 'register' ? '#6366F1' : '#6B7280',
                  boxShadow: activeTab === 'register' ? '0 2px 8px rgba(0, 0, 0, 0.1)' : 'none'
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
            color: 'white',
            fontSize: '14px',
            marginTop: '24px',
            opacity: 0.9,
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