import Stripe from "stripe";
import { prisma } from "../lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function createCheckoutSession(orderId: string) {
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true },
    });

    if (!order) {
        throw new Error("ORDER_NOT_FOUND");
    }

    // Vérifier qu'il n'existe pas déjà un paiement réussi pour cette commande
    const existingPayment = await prisma.payment.findUnique({
        where: { orderId },
    });

    if (existingPayment && existingPayment.status !== "PENDING") {
        throw new Error("ORDER_ALREADY_PAID");
    }

    // Créer ou réutiliser l'entrée paiement en DB
    const payment =
        existingPayment ??
        (await prisma.payment.create({
            data: {
                orderId: order.id,
                amount: order.total,
                currency: "eur",
                status: "PENDING",
            },
        }));

    // Créer la session Stripe
    let session: Stripe.Checkout.Session;
    try {
        session = await stripe.checkout.sessions.create({
            mode: "payment",
            payment_method_types: ["card"],
            line_items: [
                // Articles de la commande
                ...order.items.map((item) => ({
                    price_data: {
                        currency: "eur",
                        product_data: { name: item.productName },
                        unit_amount: Math.round(Number(item.unitPrice) * 100),
                    },
                    quantity: item.quantity,
                })),
                // Frais de livraison (si > 0)
                ...(Number(order.shippingCost) > 0
                    ? [{
                        price_data: {
                            currency: "eur",
                            product_data: { name: "Frais de livraison" },
                            unit_amount: Math.round(Number(order.shippingCost) * 100),
                        },
                        quantity: 1,
                    }]
                    : []),
            ],
            // URLs de retour vers les pages dédiées du frontend
            success_url: `${process.env.FRONTEND_URL}/success`,
            cancel_url: `${process.env.FRONTEND_URL}/cancel`,
            metadata: { orderId: order.id },
        });
    } catch (err) {
        console.error(`[payment] Stripe session creation failed for order ${orderId}:`, err);
        throw new Error("STRIPE_SESSION_FAILED");
    }

    // Lier la session Stripe au paiement en DB
    try {
        await prisma.payment.update({
            where: { id: payment.id },
            data: { stripeSessionId: session.id },
        });
    } catch (err) {
        console.error(
            `[payment] CRITICAL: Stripe session ${session.id} created but failed to save in DB for order ${orderId}:`,
            err,
        );
        throw new Error("PAYMENT_SAVE_FAILED");
    }

    return session.url;
}
