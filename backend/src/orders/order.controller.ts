import { Request, Response } from "express";
import { createOrderSchema } from "./order.validation";
import { createOrder } from "./order.service";
import { AuthRequest } from "../middleware/auth.middleware";


export async function createOrderController(
    req: AuthRequest,
    res: Response
) {
    try {
        const data = createOrderSchema.parse(req.body);
        const order = await createOrder(req.user.id, data);
        res.status(201).json(order);
    } catch (e: any) {
        res.status(400).json({
            message: e.message
        });
    }
}