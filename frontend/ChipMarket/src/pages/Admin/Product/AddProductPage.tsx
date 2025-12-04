// src/pages/Admin/Product/AddProductPage.tsx
import React, { useState, useEffect } from 'react';
import { useAddProduct } from '../../../hooks/useAddProduct';
import { ProductProvider, useProducts } from '../../../context/ProductContext';
import '../../../styles/AddProductPage.css';

const AddProductForm: React.FC = () => {
  const { fetchProducts, error } = useProducts();
  const { formData, handleChange, handleSubmit, loading, successMessage, errorMessage, errors } = useAddProduct();

  const [showComponents, setShowComponents] = useState(true);
  const [isCheckingSKU, setIsCheckingSKU] = useState(false);
  const [skuExists, setSkuExists] = useState(false);

  // Función para generar SKU único (formato: SKU + 10 dígitos)
  const generateSKU = (): string => {
    // Usar últimos 6 dígitos del timestamp + 4 dígitos random = 10 dígitos total
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `SKU${timestamp}${random}`;
  };

  // Verificar si el SKU ya existe
  const checkSKUExists = async (sku: string): Promise<boolean> => {
    if (!sku || sku.trim() === '') return false;
    
    try {
      // Obtener todos los productos y buscar el SKU manualmente
      const response = await fetch(`/api/productos?limit=1000`);
      const data = await response.json();
      
      if (data.success && data.data?.productos) {
        // Buscar si algún producto tiene este SKU
        const found = data.data.productos.some((p: any) => p.sku === sku);
        return found;
      }
      return false;
    } catch (err) {
      console.error('Error verificando SKU:', err);
      return false;
    }
  };

  // Generar SKU automáticamente al montar el componente
  useEffect(() => {
    if (!formData.sku || formData.sku === '') {
      const newSKU = generateSKU();
      handleChange('sku', newSKU);
    }
  }, []); // Solo al montar

  // Verificar SKU cuando cambie
  useEffect(() => {
    const verifySKU = async () => {
      if (formData.sku && formData.sku.trim() !== '') {
        setIsCheckingSKU(true);
        const exists = await checkSKUExists(formData.sku);
        setSkuExists(exists);
        setIsCheckingSKU(false);
      }
    };

    const timeoutId = setTimeout(verifySKU, 500); // Debounce de 500ms
    return () => clearTimeout(timeoutId);
  }, [formData.sku]);

  // Manejar generación manual de nuevo SKU
  const handleGenerateNewSKU = async () => {
    let newSKU = generateSKU();
    let attempts = 0;
    const maxAttempts = 5;

    // Intentar generar un SKU único
    while (attempts < maxAttempts) {
      const exists = await checkSKUExists(newSKU);
      if (!exists) {
        handleChange('sku', newSKU);
        return;
      }
      newSKU = generateSKU();
      attempts++;
    }

    // Si después de 5 intentos no se genera uno único, usar timestamp más largo
    const uniqueSKU = `SKU${Date.now()}${Math.floor(Math.random() * 10000)}`;
    handleChange('sku', uniqueSKU);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar SKU antes de enviar
    if (skuExists) {
      alert('El SKU ya existe. Por favor genera uno nuevo.');
      return;
    }

    const success = await handleSubmit();
    if (success) {
      await fetchProducts();
      // Generar nuevo SKU para el siguiente producto
      handleGenerateNewSKU();
    }
  };

  return (
    <div className="add-product-page">
      <h2>Agregar Nuevo Producto</h2>
      <form onSubmit={onSubmit} className="add-product-form">

        {/* Sección Información Básica */}
        <div className="form-section">
          <h3>Información Básica</h3>
          
          {/* Campo SKU con generación automática */}
          <div className="form-group">
            <label>SKU *</label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={e => handleChange('sku', e.target.value)}
                  placeholder="Ej: SKU12345678901"
                  style={{
                    width: '100%',
                    borderColor: skuExists ? '#ef4444' : isCheckingSKU ? '#fbbf24' : undefined
                  }}
                />
                {isCheckingSKU && (
                  <span style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '0.875rem',
                    color: '#6b7280'
                  }}>
                    🔍 Verificando...
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={handleGenerateNewSKU}
                style={{
                  padding: '0.625rem 1rem',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#2563eb'}
                onMouseOut={(e) => e.currentTarget.style.background = '#3b82f6'}
              >
                🔄 Generar
              </button>
            </div>
            {errors.sku && <div className="error-message">{errors.sku}</div>}
            {skuExists && (
              <div className="error-message" style={{ 
                background: '#fee2e2', 
                color: '#991b1b',
                padding: '0.5rem',
                borderRadius: '6px',
                marginTop: '0.5rem',
                fontSize: '0.875rem'
              }}>
                ⚠️ Este SKU ya existe. Genera uno nuevo.
              </div>
            )}
            {!skuExists && formData.sku && !isCheckingSKU && (
              <div style={{ 
                background: '#d1fae5', 
                color: '#065f46',
                padding: '0.5rem',
                borderRadius: '6px',
                marginTop: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: 500
              }}>
                ✓ SKU disponible
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Nombre *</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => handleChange('name', e.target.value)}
              placeholder="Ej: Procesador Intel"
            />
            {errors.name && <div className="error-message">{errors.name}</div>}
          </div>

          <div className="form-group">
            <label>Precio *</label>
            <input
              type="number"
              value={formData.price}
              onChange={e => handleChange('price', Number(e.target.value))}
            />
            {errors.price && <div className="error-message">{errors.price}</div>}
          </div>

          <div className="form-group">
            <label>Categoría *</label>
            <input
              type="text"
              value={formData.category}
              onChange={e => handleChange('category', e.target.value)}
              placeholder="Ej: Procesadores, GPU, RAM..."
            />
            {errors.category && <div className="error-message">{errors.category}</div>}
          </div>

          <div className="form-group">
            <label>Stock *</label>
            <input
              type="number"
              value={formData.stock}
              onChange={e => handleChange('stock', Number(e.target.value))}
            />
            {errors.stock && <div className="error-message">{errors.stock}</div>}
          </div>

          <div className="form-group">
            <label>Imágenes (URLs, separadas por coma)</label>
            <input
              type="text"
              value={formData.images.join(', ')}
              onChange={e => handleChange('images', e.target.value.split(',').map(s => s.trim()))}
              placeholder="https://img1.jpg, https://img2.jpg"
            />
          </div>

          <div className="form-group">
            <label>Garantía</label>
            <input
              type="text"
              value={formData.garantee}
              onChange={e => handleChange('garantee', e.target.value)}
              placeholder="Ej: 12 meses"
            />
          </div>
        </div>

        {/* Sección Componentes */}
        <div className="form-section">
          <h3>Componentes del Producto</h3>
          <button
            type="button"
            className="toggle-button"
            onClick={() => setShowComponents(!showComponents)}
          >
            {showComponents ? 'Ocultar Componentes' : 'Mostrar Componentes'}
          </button>

          {showComponents && (
            <div className="components-grid">
              <div className="component-card">
                <label>CPU</label>
                <input
                  type="text"
                  value={formData.components.procesator || ''}
                  onChange={e => handleChange('components', { ...formData.components, procesator: e.target.value })}
                  placeholder="Ej: Intel i7-12700K"
                />
              </div>

              <div className="component-card">
                <label>GPU</label>
                <input
                  type="text"
                  value={formData.components.gpu || ''}
                  onChange={e => handleChange('components', { ...formData.components, gpu: e.target.value })}
                  placeholder="Ej: NVIDIA RTX 3080"
                />
              </div>

              <div className="component-card">
                <label>RAM</label>
                <input
                  type="text"
                  value={formData.components.ram || ''}
                  onChange={e => handleChange('components', { ...formData.components, ram: e.target.value })}
                  placeholder="Ej: 16GB DDR4"
                />
              </div>

              <div className="component-card">
                <label>Placa Base</label>
                <input
                  type="text"
                  value={formData.components.mother_board || ''}
                  onChange={e => handleChange('components', { ...formData.components, mother_board: e.target.value })}
                  placeholder="Ej: ASUS ROG Strix B550-F"
                />
              </div>

              <div className="component-card">
                <label>Almacenamiento</label>
                <input
                  type="text"
                  value={formData.components.storage || ''}
                  onChange={e => handleChange('components', { ...formData.components, storage: e.target.value })}
                  placeholder="Ej: 1TB SSD"
                />
              </div>

              <div className="component-card">
                <label>Fuente de Poder</label>
                <input
                  type="text"
                  value={formData.components.power_supply || ''}
                  onChange={e => handleChange('components', { ...formData.components, power_supply: e.target.value })}
                  placeholder="Ej: 650W 80+ Gold"
                />
              </div>

              <div className="component-card">
                <label>Sistema de Enfriamiento</label>
                <input
                  type="text"
                  value={formData.components.cooling_system || ''}
                  onChange={e => handleChange('components', { ...formData.components, cooling_system: e.target.value })}
                  placeholder="Ej: Cooler Master Hyper 212"
                />
              </div>

              <div className="component-card">
                <label>Gabinete</label>
                <input
                  type="text"
                  value={formData.components.case || ''}
                  onChange={e => handleChange('components', { ...formData.components, case: e.target.value })}
                  placeholder="Ej: NZXT H510"
                />
              </div>

              <div className="component-card">
                <label>Sistema Operativo</label>
                <input
                  type="text"
                  value={formData.components.operative_system || ''}
                  onChange={e => handleChange('components', { ...formData.components, operative_system: e.target.value })}
                  placeholder="Ej: Windows 11 Pro"
                />
              </div>
            </div>
          )}
        </div>

        <button 
          type="submit" 
          disabled={loading || skuExists} 
          className="submit-button"
          style={{
            opacity: (loading || skuExists) ? 0.5 : 1,
            cursor: (loading || skuExists) ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Creando...' : 'Crear Producto'}
        </button>

        {errorMessage && <div className="error-message">{errorMessage}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}
        {error && <div className="error-message">{error}</div>}
      </form>
    </div>
  );
};

export const AddProductPage: React.FC = () => {
  return (
    <ProductProvider>
      <AddProductForm />
    </ProductProvider>
  );
};