// routes/productRoutes.ts
import { Router } from "express";
import * as productController from "../controllers/productController";

const router = Router();

// ⚠️ IMPORTANTE: Las rutas específicas ANTES de las rutas con parámetros
router.get("/search", productController.buscarProductos);
router.post("/", productController.agregarProducto);
router.get("/", productController.listarProductos);
router.get("/:id", productController.obtenerProducto);
router.put("/:id", productController.actualizarProducto);
router.delete("/:id", productController.eliminarProducto);

export default router;