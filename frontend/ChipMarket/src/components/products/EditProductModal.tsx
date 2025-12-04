// src/components/products/EditProductModal.tsx
import React, { useState } from 'react';
import type { Product } from '../../types/product.types';
import '../../styles/EditProductModal.css';

interface EditProductModalProps {
  product: Product;
  onClose: () => void;
  onSave: (updatedProduct: Product) => void;
}

export const EditProductModal: React.FC<EditProductModalProps> = ({
  product,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState({
    name: product.name,
    sku: product.sku,
    price: product.price,
    stock: product.stock,
    category: product.category,
    components: {
      procesator: product.components?.procesator || '',
      mother_board: product.components?.mother_board || '',
      ram: product.components?.ram || '',
      storage: product.components?.storage || '',
      gpu: product.components?.gpu || '',
      power_supply: product.components?.power_supply || '',
      cooling_system: product.components?.cooling_system || '',
      case: product.components?.case || '',
      operative_system: product.components?.operative_system || ''
    },
    garantee: product.garantee || ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (Object.keys(formData.components).includes(name)) {
      setFormData({
        ...formData,
        components: { ...formData.components, [name]: value }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`/api/productos/${product._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage('Producto actualizado exitosamente');
        setTimeout(() => {
          onSave(data.data);
        }, 1000);
      } else {
        setMessage(`Error: ${data.message || 'No se pudo actualizar el producto'}`);
      }
    } catch (err) {
      setMessage('Error de conexión con el servidor');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const componentLabels: Record<string, string> = {
    procesator: 'Procesador',
    mother_board: 'Placa Madre',
    ram: 'Memoria RAM',
    storage: 'Almacenamiento',
    gpu: 'Tarjeta Gráfica',
    power_supply: 'Fuente de Poder',
    cooling_system: 'Sistema de Enfriamiento',
    case: 'Gabinete',
    operative_system: 'Sistema Operativo'
  };

  return (
    <div className="edit-product-modal">
      <div className="edit-product-modal__overlay" onClick={onClose} />
      <div className="edit-product-modal__content">
        <div className="edit-product-modal__header">
          <h2>Editar Producto</h2>
          <button className="edit-product-modal__close" onClick={onClose} type="button">
            ✕
          </button>
        </div>

        <div className="edit-product-modal__body">
          <form onSubmit={handleSubmit} className="edit-product-modal__form">
            {/* Sección: Información Principal */}
            <div className="edit-product-modal__section edit-product-modal__section--main">
              <h3 className="edit-product-modal__section-title">Información Principal</h3>
              
              <div className="edit-product-modal__field edit-product-modal__field--full">
                <label htmlFor="name">Nombre del Producto</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="edit-product-modal__field">
                <label htmlFor="sku">SKU</label>
                <input
                  id="sku"
                  name="sku"
                  type="text"
                  value={formData.sku}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="edit-product-modal__field">
                <label htmlFor="category">Categoría</label>
                <input
                  id="category"
                  name="category"
                  type="text"
                  value={formData.category}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              <div className="edit-product-modal__field">
                <label htmlFor="price">Precio ($)</label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  disabled={loading}
                />
              </div>

              <div className="edit-product-modal__field">
                <label htmlFor="stock">Stock</label>
                <input
                  id="stock"
                  name="stock"
                  type="number"
                  value={formData.stock}
                  onChange={handleChange}
                  required
                  min="0"
                  disabled={loading}
                />
              </div>

              <div className="edit-product-modal__field edit-product-modal__field--full">
                <label htmlFor="garantee">Garantía</label>
                <input
                  id="garantee"
                  name="garantee"
                  type="text"
                  value={formData.garantee}
                  onChange={handleChange}
                  placeholder="Ej: 3 años"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Sección: Componentes */}
            <div className="edit-product-modal__section edit-product-modal__section--components">
              <h3 className="edit-product-modal__section-title">Componentes del Equipo</h3>
              
              <div className="edit-product-modal__components-grid">
                {Object.keys(formData.components).map(key => (
                  <div key={key} className="edit-product-modal__component-field">
                    <label htmlFor={key}>
                      {componentLabels[key] || key}
                    </label>
                    <input
                      id={key}
                      name={key}
                      type="text"
                      value={formData.components[key as keyof typeof formData.components]}
                      onChange={handleChange}
                      disabled={loading}
                      placeholder={`Ingrese ${componentLabels[key]?.toLowerCase() || key}`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Mensaje de estado */}
            {message && (
              <div className="edit-product-modal__message">
                {message}
              </div>
            )}

            {/* Botones de acción */}
            <div className="edit-product-modal__buttons">
              <button type="button" onClick={onClose} disabled={loading}>
                Cancelar
              </button>
              <button type="submit" disabled={loading}>
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};