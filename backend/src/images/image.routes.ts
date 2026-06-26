import { Router } from "express";
import { createImage, getImages, updateImage, deleteImage } from "./image.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { adminOnly } from "../middleware/role.middleware";

const router = Router();

//PUBLIC
router.get("/product/:productId", getImages);

//ADMIN
router.post("/", authMiddleware, adminOnly, createImage);
router.put("/:id", authMiddleware, adminOnly, updateImage);
router.delete("/:id", authMiddleware, adminOnly, deleteImage);

export default router;
