// services/productService.ts
import ProductoModel, { Producto } from "../models/productoModels";

// Crear producto
export const crearProducto = async (data: Omit<Producto, "_id">) => {
  // Verificar que el SKU no exista
  const existingSKU = await ProductoModel.findOne({ sku: data.sku?.toUpperCase() });
  if (existingSKU) {
    throw new Error('El SKU ya existe');
  }

  const producto = new ProductoModel({
    ...data,
    sku: data.sku?.toUpperCase() // Normalizar SKU
  });
  return await producto.save();
};

// Listar productos con paginación
export const listarProductos = async (page: number = 1, limit: number = 10) => {
  const skip = (page - 1) * limit;
  
  const [productos, total] = await Promise.all([
    ProductoModel.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    ProductoModel.countDocuments()
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    productos,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  };
};

// Obtener producto por ID
export const obtenerProductoPorId = async (id: string) => {
  return await ProductoModel.findById(id);
};

// Buscar por SKU
export const buscarPorSKU = async (sku: string) => {
  return await ProductoModel.findOne({ sku: sku.toUpperCase() });
};

// Actualizar producto
export const actualizarProducto = async (
  id: string, 
  datos: Partial<Omit<Producto, "_id">>
) => {
  // Si se actualiza el SKU, verificar que no exista
  if (datos.sku) {
    const existingSKU = await ProductoModel.findOne({ 
      sku: datos.sku.toUpperCase(),
      _id: { $ne: id }
    });
    if (existingSKU) {
      throw new Error('El SKU ya existe');
    }
    datos.sku = datos.sku.toUpperCase();
  }

  return await ProductoModel.findByIdAndUpdate(
    id, 
    { $set: datos },
    { 
      new: true,
      runValidators: true
    }
  );
};

// Eliminar producto
export const eliminarProducto = async (id: string) => {
  const result = await ProductoModel.findByIdAndDelete(id);
  return !!result;
};

// Búsqueda por nombre o SKU
export const buscarProductos = async (
  query: string,
  page: number = 1,
  limit: number = 10
) => {
  const skip = (page - 1) * limit;
  
  const searchFilter = {
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { sku: { $regex: query, $options: 'i' } },
      { category: { $regex: query, $options: 'i' } }
    ]
  };

  const [productos, total] = await Promise.all([
    ProductoModel.find(searchFilter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    ProductoModel.countDocuments(searchFilter)
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    productos,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  };
};