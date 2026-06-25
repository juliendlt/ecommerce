import rateLimit from "express-rate-limit";

export const loginLimiter =
rateLimit({
    windowMs:  5 * 60 * 1000,
    max:  10,
    message:{
        message:"TOO_MANY_LOGIN_ATTEMPTS"
    },
    standardHeaders:true,
    legacyHeaders:false
});