import { Router } from "express";
import {
    createProduct,
    getProducts,
    getAllProductsAdmin,
    getProduct,
    updateProduct,
    deleteProduct,
} from "./product.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { adminOnly } from "../middleware/role.middleware";

const router = Router();

// public
router.get("/", getProducts);

// admin — déclarée AVANT "/:slug" pour que "admin/all" ne soit pas
// interprété comme un slug de produit par Express
router.get("/admin/all", authMiddleware, adminOnly, getAllProductsAdmin);

router.get("/:slug", getProduct);

// admin
router.post("/", authMiddleware, adminOnly, createProduct);
router.put("/:id", authMiddleware, adminOnly, updateProduct);
router.delete("/:id", authMiddleware, adminOnly, deleteProduct);

export default router;
