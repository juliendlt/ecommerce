import { Router } from "express";
import { createOption, getOptions, updateOption, deleteOption } from "./option.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { adminOnly } from "../middleware/role.middleware";


const router = Router();

// public
router.get("/", getOptions);

// admin
router.post("/", authMiddleware, adminOnly, createOption);
router.put("/:id", authMiddleware, adminOnly, updateOption);
router.delete("/:id", authMiddleware, adminOnly, deleteOption);

export default router;