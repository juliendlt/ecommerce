import { Router } from "express";
import { createCategory, getCategories, getCategory, updateCategory, deleteCategory } from "./category.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { adminOnly } from "../middleware/role.middleware";

const router = Router();

// PUBLIC
router.get("/", getCategories);
router.get("/:slug", getCategory);

// ADMIN
router.post("/", authMiddleware, adminOnly, createCategory);
router.put("/:id", authMiddleware, adminOnly, updateCategory);
router.delete("/:id", authMiddleware, adminOnly, deleteCategory);

export default router;