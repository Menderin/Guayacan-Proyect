import { crearProducto, listarProductos, actualizarProducto, eliminarProducto } from './models/productoModels';

function main() {
  console.log('--- Registrando productos ---');

  const prod1 = crearProducto({
    nombre: 'CPU',
    descripcion: 'Lo más rápido del planeta',
    precio: 1000000,
    stock: 25,
    categoria: 'CPU',
    imagenURL: 'insertar imagen'
  });

  const prod2 = crearProducto({
    nombre: 'GPU',
    descripcion: 'Las mejoras gráficas que verás en tu vida',
    precio: 10000000,
    stock: 10,
    categoria: 'GPU',
    imagenURL: 'insertar imagen'
  });

  console.table(listarProductos());

  console.log('\n--- Actualizando producto ---');
  const actualizado = actualizarProducto(prod1.id_Producto, { precio: 950000, stock: 30 });
  console.log('Producto actualizado:', actualizado);

  console.log('\n--- Eliminando producto ---');
  const eliminado = eliminarProducto(prod2.id_Producto);
  console.log('Producto eliminado:', eliminado);

  console.log('\n--- Productos finales ---');
  console.table(listarProductos());
}

main();