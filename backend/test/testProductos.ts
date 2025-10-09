import mongoose from "mongoose";

// URI de conexión directa
const MONGO_URL = "mongodb://mongodb:mongodb123@localhost:27017/ecommerce?authSource=admin";

// Esquema mínimo para productos
const productSchema = new mongoose.Schema({}, { strict: false, collection: "products" });
const Product = mongoose.model("Product", productSchema);

const runTest = async () => {
  try {
    console.log("🔗 Conectando a MongoDB...");
    await mongoose.connect(MONGO_URL);
    console.log("✅ Conexión exitosa");

    console.log("🌱 Probando CRUD de productos...");

    // Crear producto de prueba
    const nuevoProducto = new Product({
      sku: "SKU5555555555",
      name: "PC Testeo",
      price: 999999,
      category: "Computadores",
      stock: 15,
      images: ["http://localhost:3000/assets/images/pc.png"],
      components: {
        procesator: "Intel Core i7",
        mother_board: "ASUS Prime",
        ram: "16GB",
        storage: "1TB SSD",
        gpu: "RTX 3060",
        power_supply: "650W",
        cooling_system: "Cooler Master",
        case: "NZXT H510",
        operative_system: "Windows 11"
      },
      garantee: "1 año",
      reviews: []
    });

    const creado = await nuevoProducto.save();
    console.log("✅ Producto creado:", creado);

    // Listar productos
    const productos = await Product.find();
    console.log("📦 Productos en DB:", productos.length);

    // Actualizar producto
    const actualizado = await Product.findOneAndUpdate(
      { sku: "SKU5555555555" },
      { stock: 20 },
      { new: true }
    );
    console.log("✏️ Producto actualizado:", actualizado);

    // Eliminar producto
    const eliminado = await Product.findOneAndDelete({ sku: "SKU5555555555" });
    console.log("🗑️ Producto eliminado:", eliminado ? "Sí" : "No");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error en test:", error);
    process.exit(1);
  }
};

runTest();