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