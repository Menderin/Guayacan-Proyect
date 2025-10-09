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

    const productos = await Product.find();
    console.log(`📦 Total productos en DB: ${productos.length}`);
    console.log("📝 Productos:", productos);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error al probar Mongo:", error);
    process.exit(1);
  }
};

runTest();