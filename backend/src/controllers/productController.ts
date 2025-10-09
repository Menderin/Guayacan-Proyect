import { Request, Response } from "express";
import * as productService from "../services/productService";

export const agregarProducto = async (req: Request, res: Response) => {
  try {
    const producto = await productService.crearProducto(req.body);
    res.status(201).json(producto);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const listarProductos = async (req: Request, res: Response) => {
  const productos = await productService.listarProductos();
  res.json(productos);
};

export const actualizarProducto = async (req: Request, res: Response) => {
  const producto = await productService.actualizarProducto(req.params.id, req.body);
  if (!producto) return res.status(404).json({ message: "Producto no encontrado" });
  res.json(producto);
};

export const eliminarProducto = async (req: Request, res: Response) => {
  const eliminado = await productService.eliminarProducto(req.params.id);
  if (!eliminado) return res.status(404).json({ message: "Producto no encontrado" });
  res.json({ message: "Producto eliminado correctamente" });
};