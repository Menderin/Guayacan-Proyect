// routes/productRoutes.ts
import { Router } from "express";
import * as productController from "../controllers/productController";

const router = Router();

// ✅ RUTAS ESPECÍFICAS PRIMERO (antes de /:id)
router.get("/search", productController.buscarProductos);
router.get("/poco-stock", productController.obtenerProductosConPocoStock); // ⬆️ Mover aquí

// Rutas generales
router.post("/", productController.agregarProducto);
router.get("/", productController.listarProductos);

// ❌ RUTAS DINÁMICAS AL FINAL (después de las específicas)
router.get("/:id", productController.obtenerProducto);
router.put("/:id", productController.actualizarProducto);
router.delete("/:id", productController.eliminarProducto);

export default router;