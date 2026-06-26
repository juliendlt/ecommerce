import express from "express";
import helmet from "helmet";
import cors from "cors";
import { apiLimiter } from "./middleware/rateLimit.middleware";
import { notFoundMiddleware } from "./middleware/notFound.middleware";
import { errorMiddleware } from "./middleware/error.middleware";
import { securityConfig } from "./config/security";

import authRoutes from "./auth/auth.routes";
import productRoutes from "./products/product.routes";
import optionRoutes from "./options/option.routes";
import orderRoutes from "./orders/order.routes";
import paymentRoutes from "./payments/payment.routes";
import imageRoutes from "./images/image.routes";
import categoryRoutes from "./categories/category.routes";
import userRoutes from "./users/user.routes";

import { stripeWebhook } from "./payments/payment.webhook";

const app = express();

// sécurité headers
app.use(helmet());

// cors
app.use(cors(securityConfig.cors));

// limitation API
app.use(apiLimiter);

// body parser
app.post("/api/payments/webhook", express.raw({ type: "application/json" }), stripeWebhook);
app.use(express.json({ limit: "10kb" }));

//Route
app.use("/api/payments", paymentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/options", optionRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/users", userRoutes);

// routes inconnues
app.use(notFoundMiddleware);

// erreurs globales
app.use(errorMiddleware);

export default app;
