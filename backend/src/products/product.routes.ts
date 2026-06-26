import { Router } from "express";
import {
    createProduct,
    getProducts,
    getProduct,
    updateProduct,
    deleteProduct,
} from "./product.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { adminOnly } from "../middleware/role.middleware";

const router = Router();

// public
router.get("/", getProducts);
router.get("/:slug", getProduct);

// admin
router.post("/", authMiddleware, adminOnly, createProduct);
router.put("/:id", authMiddleware, adminOnly, updateProduct);
router.delete("/:id", authMiddleware, adminOnly, deleteProduct);

export default router;
