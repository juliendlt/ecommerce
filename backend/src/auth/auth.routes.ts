import { Router } from "express";
import { registerController, loginController } from "./auth.controller";
import {loginLimiter} from "./loginLimiter";


const router = Router();

router.post("/register", registerController);
router.post("/login",loginLimiter,loginController
);
export default router;