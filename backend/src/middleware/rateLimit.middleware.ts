import rateLimit from "express-rate-limit";

import { securityConfig } from "../config/security";

export const apiLimiter = rateLimit({
    windowMs: securityConfig.rateLimit.windowMs,
    max: securityConfig.rateLimit.max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: "TOO_MANY_REQUESTS",
    },
});
