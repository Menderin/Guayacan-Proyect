import { useState } from 'react';
import { useProducts } from '../context/ProductContext';
import type { Product } from '../types/product.types';

export const useAddProduct = () => {
  const { createProduct, creatingProduct } = useProducts();

  const [formData, setFormData] = useState<Omit<Product, '_id'>>({
    sku: '',
    name: '',
    price: 0,
    category: '',
    stock: 0,
    images: [],
    components: {},
    garantee: '',
    reviews: [],
  });

  const [errors, setErrors] = useState<Partial<Record<keyof Omit<Product, '_id'>, string>>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!formData.sku.trim()) newErrors.sku = 'SKU es requerido';
    if (!formData.name.trim()) newErrors.name = 'Nombre es requerido';
    if (formData.price <= 0) newErrors.price = 'Precio debe ser mayor a 0';
    if (!formData.category.trim()) newErrors.category = 'Categoría es requerida';
    if (formData.stock < 0) newErrors.stock = 'Stock no puede ser negativo';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async () => {
  console.log("handleSubmit iniciado", formData);
  setSuccessMessage(null);
  setErrorMessage(null);

  if (!validateForm()) {
    console.log("Validación fallida", errors);
    return false;
  }

  console.log("Validación exitosa, llamando a createProduct");
  const result = await createProduct(formData);
  console.log("Resultado createProduct:", result);

  if (result.success) {
    setSuccessMessage(result.message);
    setFormData({ sku: '', name: '', price: 0, stock: 0, category: '', images: [], components: {}, garantee: '', reviews: [] });
    return true;
  } else {
    setErrorMessage(result.message);
    return false;
  }
};
  const resetForm = () => {
    setFormData({
      sku: '',
      name: '',
      price: 0,
      category: '',
      stock: 0,
      images: [],
      components: {},
      garantee: '',
      reviews: [],
    });
    setErrors({});
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  return {
    formData,
    errors,
    successMessage,
    errorMessage,
    loading: creatingProduct,
    handleChange,
    handleSubmit,
    resetForm,
  };
};
