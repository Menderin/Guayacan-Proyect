import express, { Application, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";
import searchRoutes from "./routes/search.routes";
import productRoutes from "./routes/productRoutes";
import orderRoutes from "./routes/order.routes";
import userRoutes from "./routes/user.routes";
import { connectMongoDB, seedDatabase } from "../database/mongodb/init";
import pool from "../database/postgres/config";
import path from 'path';
import e from "express";

// Cargar variables de entorno
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/search", searchRoutes);

// Ruta de prueba
app.get("/", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "API de Guayacan funcionando correctamente",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      search: "/api/search",
      products: "/api/productos",
      orders: "/api/orders",
      users: "/api/users"
    }
  });
});

//gestionarProductos
app.use("/api/productos", productRoutes);

// Ruta de health check
app.get("/health", async (req: Request, res: Response) => {
  try {
    // Verificar PostgreSQL
    await pool.query("SELECT 1");

    res.json({
      success: true,
      message: "Servidor funcionando correctamente",
      databases: {
        postgres: "connected",
        mongodb: "connected",
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error en el servidor",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});


app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);

// Manejo de rutas no encontradas
app.use("*", (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Ruta no encontrada",
  });
});

// Manejo de errores global
app.use((err: Error, req: Request, res: Response) => {
  console.error("Error global:", err);
  res.status(500).json({
    success: false,
    message: "Error interno del servidor",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Iniciar servidor
const startServer = async () => {
  try {
    // Conectar a MongoDB
    await connectMongoDB();

    // Seed de MongoDB (solo si no hay productos)
    await seedDatabase();

    // Iniciar servidor Express
    app.listen(PORT, () => {
      console.log("🚀 ========================================");
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
      console.log(`🚀 Modo: ${process.env.NODE_ENV || "development"}`);
      console.log("🚀 ========================================");
      console.log(`📍 API: http://localhost:${PORT}`);
      console.log(`📍 Health: http://localhost:${PORT}/health`);
      console.log("🚀 ========================================");
    });
  } catch (error) {
    console.error("❌ Error al iniciar el servidor:", error);
    process.exit(1);
  }
};

// Manejo de señales de terminación
process.on("SIGTERM", async () => {
  console.log("⚠️  SIGTERM recibido. Cerrando servidor...");
  await pool.end();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("⚠️  SIGINT recibido. Cerrando servidor...");
  await pool.end();
  process.exit(0);
});

startServer();
