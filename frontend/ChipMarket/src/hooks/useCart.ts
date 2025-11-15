// src/hooks/useCart.ts

import { useState, useEffect } from 'react';
import type { Product } from '../types/product.types';

export interface CartItem {
  product: Product;
  quantity: number;
}

export const useCart = () => {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Cargar carrito desde localStorage al iniciar
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    }
  }, []);

  // Guardar carrito en localStorage cada vez que cambie
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: Product, quantity: number = 1) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(item => item.product.sku === product.sku);
      
      if (existingItem) {
        // Si ya existe, actualizar cantidad
        return prevCart.map(item =>
          item.product.sku === product.sku
            ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) }
            : item
        );
      } else {
        // Si no existe, agregar nuevo item
        return [...prevCart, { product, quantity: Math.min(quantity, product.stock) }];
      }
    });
  };

  const removeFromCart = (sku: string) => {
    setCart((prevCart) => prevCart.filter(item => item.product.sku !== sku));
  };

  const updateQuantity = (sku: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(sku);
      return;
    }

    setCart((prevCart) =>
      prevCart.map(item =>
        item.product.sku === sku
          ? { ...item, quantity: Math.min(quantity, item.product.stock) }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const isInCart = (sku: string) => {
    return cart.some(item => item.product.sku === sku);
  };

  const getItemQuantity = (sku: string) => {
    const item = cart.find(item => item.product.sku === sku);
    return item ? item.quantity : 0;
  };

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    isInCart,
    getItemQuantity
  };
};