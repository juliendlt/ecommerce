import { Request, Response } from "express";
import { createCheckoutSession } from "./payment.service";

export async function createPayment(req: Request, res: Response) {
    try {
        const url = await createCheckoutSession(req.body.orderId);
        res.json({ url });
    } catch (e: any) {
        res.status(400).json({
            message: e.message,
        });
    }
}
