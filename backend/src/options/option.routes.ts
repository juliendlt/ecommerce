import { Router } from "express";
import {
    createOption,
    getOptions,
    updateOption,
    deleteOption,
    attachOption,
    deleteOptionGroup,
} from "./option.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { adminOnly } from "../middleware/role.middleware";

const router = Router();

// public
router.get("/", getOptions);

// admin
router.post("/", authMiddleware, adminOnly, createOption);
router.put("/:id", authMiddleware, adminOnly, updateOption);
router.delete("/:id", authMiddleware, adminOnly, deleteOption);

// admin — lier une option existante à un produit (créé un groupe ou l'étend)
router.post("/attach", authMiddleware, adminOnly, attachOption);

// admin — supprimer un groupe d'options d'un produit
router.delete("/groups/:groupId", authMiddleware, adminOnly, deleteOptionGroup);

export default router;
