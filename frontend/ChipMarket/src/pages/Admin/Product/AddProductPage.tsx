// src/pages/Admin/Product/AddProductPage.tsx
import React, { useState } from 'react';
import { useAddProduct } from '../../../hooks/useAddProduct';
import { ProductProvider, useProducts } from '../../../context/ProductContext';
import '../../../styles/AddProductPage.css';

const AddProductForm: React.FC = () => {
  const { fetchProducts, error } = useProducts();
  const { formData, handleChange, handleSubmit, loading, successMessage, errorMessage, errors } = useAddProduct();

  const [showComponents, setShowComponents] = useState(true);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await handleSubmit();
    if (success) {
      await fetchProducts();
    }
  };

  return (
    <div className="add-product-page">
      <h2>Agregar Nuevo Producto</h2>
      <form onSubmit={onSubmit} className="add-product-form">

        {/* Sección Información Básica */}
        <div className="form-section">
          <h3>Información Básica</h3>
          <div className="form-group">
            <label>SKU *</label>
            <input
              type="text"
              value={formData.sku}
              onChange={e => handleChange('sku', e.target.value)}
              placeholder="Ej: 12345"
            />
            {errors.sku && <div className="error-message">{errors.sku}</div>}
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

        <button type="submit" disabled={loading} className="submit-button">
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
