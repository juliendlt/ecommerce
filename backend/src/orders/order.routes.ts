import { Router } from "express";
import {
    createOrder,
    getMyOrders,
    getMyOrder,
    getAllOrders,
    updateOrderStatus,
} from "./order.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { adminOnly } from "../middleware/role.middleware";

const router = Router();

router.post("/", authMiddleware, createOrder);
router.get("/", authMiddleware, getMyOrders);
router.get("/admin/all", authMiddleware, adminOnly, getAllOrders);
router.get("/:id", authMiddleware, getMyOrder);
router.patch("/:id/status", authMiddleware, adminOnly, updateOrderStatus);

export default router;
