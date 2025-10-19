// controllers/productController.ts
import { Request, Response } from "express";
import * as productService from "../services/productService";

export const agregarProducto = async (req: Request, res: Response) => {
  try {
    // Validación básica
    if (!req.body.name || !req.body.price || !req.body.sku) {
      return res.status(400).json({ 
        success: false,
        message: 'Nombre, precio y SKU son requeridos' 
      });
    }

    const producto = await productService.crearProducto(req.body);
    res.status(201).json({
      success: true,
      data: producto,
      message: 'Producto creado exitosamente'
    });
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ 
      success: false,
      message: (error as Error).message 
    });
  }
};

export const listarProductos = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const result = await productService.listarProductos(page, limit);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error al listar productos:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al obtener productos' 
    });
  }
};

export const obtenerProducto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validar formato de ID
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ 
        success: false,
        message: 'ID inválido' 
      });
    }

    const producto = await productService.obtenerProductoPorId(id);
    
    if (!producto) {
      return res.status(404).json({ 
        success: false,
        message: 'Producto no encontrado' 
      });
    }

    res.json({
      success: true,
      data: producto
    });
  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al obtener el producto' 
    });
  }
};

export const buscarProductos = async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    
    if (!query || query.trim().length < 2) {
      return res.status(400).json({ 
        success: false,
        message: 'La búsqueda debe tener al menos 2 caracteres' 
      });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const result = await productService.buscarProductos(query, page, limit);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error al buscar productos:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al buscar productos' 
    });
  }
};

export const actualizarProducto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ 
        success: false,
        message: 'ID inválido' 
      });
    }

    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'No hay datos para actualizar' 
      });
    }

    const producto = await productService.actualizarProducto(id, req.body);
    
    if (!producto) {
      return res.status(404).json({ 
        success: false,
        message: 'Producto no encontrado' 
      });
    }

    res.json({
      success: true,
      data: producto,
      message: 'Producto actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ 
      success: false,
      message: (error as Error).message 
    });
  }
};

export const eliminarProducto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ 
        success: false,
        message: 'ID inválido' 
      });
    }

    const eliminado = await productService.eliminarProducto(id);
    
    if (!eliminado) {
      return res.status(404).json({ 
        success: false,
        message: 'Producto no encontrado' 
      });
    }

    res.json({ 
      success: true,
      message: 'Producto eliminado exitosamente' 
    });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al eliminar el producto' 
    });
  }
};