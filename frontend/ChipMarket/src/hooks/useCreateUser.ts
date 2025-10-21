// src/hooks/useCreateUser.ts
import { useState } from 'react';
import { useUsers } from '../context/UserContext';

interface FormData {
  name: string;
  email: string;
  password: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
}

export const useCreateUser = () => {
  const { createUser, creatingUser } = useUsers();
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: ''
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Validaciones
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validar nombre
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'El nombre debe tener al menos 3 caracteres';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'El nombre no puede exceder 100 caracteres';
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Formato de email inválido';
    }

    // Validar contraseña
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (!passwordRegex.test(formData.password)) {
      newErrors.password = 'La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula y un número';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambios en inputs
  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Enviar formulario
  const handleSubmit = async () => {
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!validateForm()) {
      return false;
    }

    const result = await createUser(
      formData.name.trim(),
      formData.email.trim(),
      formData.password
    );

    if (result.success) {
      setSuccessMessage(result.message);
      // Limpiar formulario
      setFormData({ name: '', email: '', password: '' });
      setErrors({});
      return true;
    } else {
      setErrorMessage(result.message);
      return false;
    }
  };

  // Resetear formulario
  const resetForm = () => {
    setFormData({ name: '', email: '', password: '' });
    setErrors({});
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  return {
    formData,
    errors,
    successMessage,
    errorMessage,
    loading: creatingUser,
    handleChange,
    handleSubmit,
    resetForm
  };
};