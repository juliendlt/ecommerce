import { Response } from "express";
import * as service from "./user.service";
import { updateUserSchema, updatePasswordSchema } from "./user.validation";
import { AuthRequest } from "../middleware/auth.middleware";

export async function getMe(req: AuthRequest, res: Response) {
    const user = await service.getUserProfile(req.user.id);
    res.json(user);
}

export async function updateMe(req: AuthRequest, res: Response) {
    try {
        const data = updateUserSchema.parse(req.body);
        const user = await service.updateUser(req.user.id, data);
        res.json(user);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
}

export async function updateMyPassword(req: AuthRequest, res: Response) {
    try {
        const data = updatePasswordSchema.parse(req.body);
        const result = await service.updatePassword(
            req.user.id,
            data.currentPassword,
            data.newPassword,
        );
        res.json(result);
    } catch (error: any) {
        res.status(400).json({
            message: error.message,
        });
    }
}
