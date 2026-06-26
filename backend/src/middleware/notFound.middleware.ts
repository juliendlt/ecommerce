import { Request, Response } from "express";

export function notFoundMiddleware(req: Request, res: Response) {
    res.status(404).json({
        message: "ROUTE_NOT_FOUND",
    });
}
