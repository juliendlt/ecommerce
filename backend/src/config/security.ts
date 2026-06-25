export const securityConfig = {
    cors: {
        origin:
            process.env.FRONTEND_URL
            || "http://localhost:3000",
        credentials: true
    },

    rateLimit: {
        windowMs: 15 * 60 * 1000,
        max: 200
    }

};