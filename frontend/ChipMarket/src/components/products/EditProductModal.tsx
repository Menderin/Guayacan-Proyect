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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        setMessage('✅ Producto actualizado');
        onSave(data.data); // Actualiza en la lista padre
      } else {
        setMessage(`⚠️ ${data.message || 'Error al actualizar producto'}`);
      }
    } catch (err) {
      setMessage('❌ Error de conexión con el servidor');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-product-modal">
      <div className="edit-product-modal__overlay" onClick={onClose} />
      <div className="edit-product-modal__content">
        <button className="edit-product-modal__close" onClick={onClose}>
          ✕
        </button>
        <h2>Editar Producto</h2>
        {message && <p className="edit-product-modal__message">{message}</p>}
        <form onSubmit={handleSubmit} className="edit-product-form">
          <label>Nombre</label>
          <input name="name" value={formData.name} onChange={handleChange} required />

          <label>SKU</label>
          <input name="sku" value={formData.sku} onChange={handleChange} required />

          <label>Precio</label>
          <input name="price" type="number" value={formData.price} onChange={handleChange} required />

          <label>Stock</label>
          <input name="stock" type="number" value={formData.stock} onChange={handleChange} required />

          <label>Categoría</label>
          <input name="category" value={formData.category} onChange={handleChange} />

          <h3>Componentes</h3>
          {Object.keys(formData.components).map(key => (
            <div key={key}>
              <label>{key}</label>
              <input
                name={key}
                value={formData.components[key as keyof typeof formData.components]}
                onChange={handleChange}
              />
            </div>
          ))}

          <label>Garantía</label>
          <input name="garantee" value={formData.garantee} onChange={handleChange} />

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
  );
};