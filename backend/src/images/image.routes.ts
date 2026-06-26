import { Router } from "express";
import { createImage, getImages, updateImage, deleteImage } from "./image.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { adminOnly } from "../middleware/role.middleware";
import { uploadMiddleware } from "../middleware/upload.middleware";

const router = Router();

// PUBLIC
router.get("/product/:productId", getImages);

// ADMIN — uploadMiddleware parse le multipart/form-data avant le controller
router.post("/", authMiddleware, adminOnly, uploadMiddleware, createImage);
router.put("/:id", authMiddleware, adminOnly, updateImage);
router.delete("/:id", authMiddleware, adminOnly, deleteImage);

export default router;
