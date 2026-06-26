import { Request, Response, NextFunction } from "express";

export function errorMiddleware(error: any, req: Request, res: Response, next: NextFunction) {
    console.error(error);

    const status = error.status || 500;
    res.status(status).json({
        message: process.env.NODE_ENV === "production" ? "INTERNAL_SERVER_ERROR" : error.message,
    });
}
