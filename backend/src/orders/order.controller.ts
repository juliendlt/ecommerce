import { Response } from "express";
import * as service from "./order.service";
import { createOrderSchema, updateOrderStatusSchema } from "./order.validation";


export async function createOrder(
    req: any,
    res: Response
) {
    try {
        const data = createOrderSchema.parse(
            req.body
        );
        const order = await service.createOrder(
            req.user.id,
            data
        );
        res.status(201).json(order);
    } catch (e: any) {
        res.status(400).json({
            message: e.message
        });
    }
}


export async function getMyOrders(
    req: any,
    res: Response
) {
    const orders =
        await service.getUserOrders(
            req.user.id
        );
    res.json(orders);
}


export async function getMyOrder(
    req: any,
    res: Response
) {
    try {
        const order = await service.getOrderById(req.params.id, req.user.id);
        res.json(order);
    } catch (e: any) {
        res.status(404).json({
            message: e.message
        });
    }
}



export async function getAllOrders(
    req: any,
    res: Response
) {
    const orders = await service.getAllOrders();
    res.json(orders);
}


export async function updateOrderStatus(
    req: any,
    res: Response
) {
    try {
        const data = updateOrderStatusSchema.parse(req.body);
        const order = await service.updateOrderStatus(req.params.id, data);
        res.json(order);
    } catch (e: any) {
        res.status(400).json({
            message: e.message
        });
    }
}