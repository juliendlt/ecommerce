import express from "express";
import cors from "cors";

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

app.use(cors());
app.post("/api/payments/webhook", express.raw({ type: "application/json" }), stripeWebhook);
app.use(express.json());


app.use("/api/payments", paymentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/options", optionRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/users", userRoutes);

export default app;
