import Stripe from "stripe";
import { prisma } from "../lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function createCheckoutSession(orderId: string) {
    const order = await prisma.order.findUnique({
        where: {
            id: orderId,
        },
        include: {
            items: true,
        },
    });

    if (!order) {
        throw new Error("ORDER_NOT_FOUND");
    }

    const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: order.items.map((item) => ({
            price_data: {
                currency: "eur",
                product_data: {
                    name: item.productName,
                },
                unit_amount: Math.round(Number(item.unitPrice) * 100),
            },
            quantity: item.quantity,
        })),

        success_url: `${process.env.FRONT_URL}/success`,
        cancel_url: `${process.env.FRONT_URL}/cancel`,
        metadata: {
            orderId: order.id,
        },
    });

    await prisma.payment.create({
        data: {
            orderId: order.id,
            stripeSessionId: session.id,
            amount: order.total,
            currency: "eur",
            status: "PENDING",
        },
    });

    return session.url;
}
