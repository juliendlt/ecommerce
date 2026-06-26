import Stripe from "stripe";
import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function stripeWebhook(req: Request, res: Response) {
    const signature = req.headers["stripe-signature"] as string;

    let event;
    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!,
        );
    } catch {
        return res.status(400).send("Invalid signature");
    }

    if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.orderId;

        if (!orderId) {
            console.error(`[webhook] session ${session.id} has no orderId in metadata`);
            return res.status(400).json({ error: "Missing orderId in session metadata" });
        }

        // Vérification : le paiement doit exister, être lié à cette session, et être en PENDING
        const payment = await prisma.payment.findUnique({
            where: { stripeSessionId: session.id },
        });

        if (!payment) {
            console.error(`[webhook] no payment found for session ${session.id}`);
            return res.status(404).json({ error: "Payment not found" });
        }

        if (payment.orderId !== orderId) {
            console.error(`[webhook] orderId mismatch: metadata=${orderId}, db=${payment.orderId}`);
            return res.status(400).json({ error: "orderId mismatch" });
        }

        if (payment.status !== "PENDING") {
            // Déjà traité — on répond 200 pour éviter les retries Stripe
            console.warn(
                `[webhook] payment ${payment.id} already processed (status: ${payment.status})`,
            );
            return res.json({ received: true });
        }

        await prisma.payment.update({
            where: { stripeSessionId: session.id },
            data: {
                status: "SUCCEEDED",
                paidAt: new Date(),
                stripePaymentId: session.payment_intent as string,
            },
        });

        await prisma.order.update({
            where: { id: payment.orderId },
            data: { status: "PAID" },
        });
    }

    res.json({ received: true });
}
