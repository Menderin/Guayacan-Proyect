import { Router } from "express";
import * as productController from "../controllers/productController";

const router = Router();

router.post("/", productController.agregarProducto);
router.get("/", productController.listarProductos);
router.put("/:id", productController.actualizarProducto);
router.delete("/:id", productController.eliminarProducto);

export default router;