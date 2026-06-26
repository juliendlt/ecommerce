import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/jwt";

export interface AuthRequest extends Request {
    user?: any;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
    const header = req.headers.authorization;
    if (!header) {
        return res.status(401).json({ message: "TOKEN_REQUIRED" });
    }

    const token = header.replace("Bearer ", "");
    try {
        req.user = verifyToken(token);
        next();
    } catch {
        return res.status(401).json({
            message: "INVALID_TOKEN",
        });
    }
}
