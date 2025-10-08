export interface Producto {
  id_Producto: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  categoria?: string;
  imagenURL?: string;
}

const productos: Producto[] = [];
let contadorId = 1;

export function crearProducto(producto: Omit<Producto, 'id_Producto'>): Producto {
  const nuevo: Producto = { id_Producto: contadorId++, ...producto };
  productos.push(nuevo);
  return nuevo;
}

export function listarProductos(): Producto[] {
  return productos;
}

export function actualizarProducto(id: number, datos: Partial<Omit<Producto, 'id_Producto'>>): Producto | null {
  const index = productos.findIndex(p => p.id_Producto === id);
  if (index === -1) return null; // No se encontró el producto

  // Actualizamos solo las propiedades que vienen en `datos`
  productos[index] = { ...productos[index], ...datos };
  return productos[index];
}

export function eliminarProducto(id: number): boolean {
  const index = productos.findIndex(p => p.id_Producto === id);
  if (index === -1) return false; // No se encontró el producto

  productos.splice(index, 1);
  return true;
}