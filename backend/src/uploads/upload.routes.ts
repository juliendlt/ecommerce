import { Router } from "express";


import { uploadProductImage, getImages, deleteImage } from "./upload.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { adminOnly } from "../middleware/role.middleware";


const router = Router();

router.post("/product", authMiddleware, adminOnly, uploadProductImage);
router.get("/product/:productId", getImages);
router.delete("/product/:id", authMiddleware, adminOnly, deleteImage);



export default router;