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

    // Vérifier qu'il n'existe pas déjà un paiement pour cette commande
    const existingPayment = await prisma.payment.findUnique({
        where: { orderId },
    });

    if (existingPayment && existingPayment.status !== "PENDING") {
        throw new Error("ORDER_ALREADY_PAID");
    }

    // 1. Créer le paiement en DB d'abord (sans sessionId encore)
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

    // 2. Créer la session Stripe — si ça échoue, le paiement PENDING en base
    //    est inoffensif et sera réutilisé à la prochaine tentative
    let session: Stripe.Checkout.Session;
    try {
        session = await stripe.checkout.sessions.create({
            mode: "payment",
            payment_method_types: ["card"],
            line_items: order.items.map((item) => ({
                price_data: {
                    currency: "eur",
                    product_data: { name: item.productName },
                    unit_amount: Math.round(Number(item.unitPrice) * 100),
                },
                quantity: item.quantity,
            })),
            success_url: `${process.env.FRONT_URL}/success`,
            cancel_url: `${process.env.FRONT_URL}/cancel`,
            metadata: { orderId: order.id },
        });
    } catch (err) {
        console.error(`[payment] Stripe session creation failed for order ${orderId}:`, err);
        throw new Error("STRIPE_SESSION_FAILED");
    }

    // 3. Lier la session Stripe au paiement maintenant qu'on a l'ID
    try {
        await prisma.payment.update({
            where: { id: payment.id },
            data: { stripeSessionId: session.id },
        });
    } catch (err) {
        // La session Stripe existe mais on n'a pas pu lier l'ID en base.
        // On logue l'erreur critique pour intervention manuelle.
        console.error(
            `[payment] CRITICAL: Stripe session ${session.id} created but failed to save in DB for order ${orderId}:`,
            err,
        );
        throw new Error("PAYMENT_SAVE_FAILED");
    }

    return session.url;
}
