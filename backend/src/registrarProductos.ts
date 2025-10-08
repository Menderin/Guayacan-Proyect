import { crearProducto, listarProductos } from './models/productoModels';

function main() {
  console.log('--- Registrando productos ---');

  const prod1 = crearProducto({
    nombre: 'Cpu',
    descripcion: 'lo mas rapido del planeta',
    precio: 1000000,
    stock: 25,
    categoria: 'Cpu',
    imagenURL: 'insertar imagen'
  });

  const prod2 = crearProducto({
    nombre: 'Gpu',
    descripcion: 'las mejoras graficas que veras en tu vida',
    precio: 10000000000,
    stock: 10,
    categoria: 'Gpu',
    imagenURL: 'insertar imagen'
  });

  console.log('Productos registrados:', prod1, prod2);

  console.log('\n--- Listando productos ---');
  console.table(listarProductos());
}

main();