import ProductoModel, { Producto } from "../models/productoModels";

// Crear producto
export const crearProducto = async (data: Omit<Producto, "_id">) => {
  const producto = new ProductoModel(data);
  return await producto.save();
};

// Listar productos
export const listarProductos = async () => {
  return await ProductoModel.find();
};

// Actualizar producto
export const actualizarProducto = async (id: string, datos: Partial<Omit<Producto, "_id">>) => {
  return await ProductoModel.findByIdAndUpdate(id, datos, { new: true });
};

// Eliminar producto
export const eliminarProducto = async (id: string) => {
  const result = await ProductoModel.findByIdAndDelete(id);
  return !!result;
};