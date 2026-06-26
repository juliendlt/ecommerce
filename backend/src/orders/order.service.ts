import { prisma } from "../lib/prisma";
import { CreateOrderInput, UpdateOrderStatusInput } from "./order.types";

export async function createOrder(userId: string, data: CreateOrderInput) {
    let subtotal = 0;
    const items = [];

    for (const item of data.items) {
        const product = await prisma.product.findUnique({
            where: { id: item.productId },
            include: {
                optionGroups: {
                    include: { values: true },
                },
            },
        });

        if (!product) {
            throw new Error("PRODUCT_NOT_FOUND");
        }

        let price = Number(product.basePrice);

        if (item.optionsSnapshot) {
            for (const value of Object.values(item.optionsSnapshot)) {
                const option = product.optionGroups
                    .flatMap((group) => group.values)
                    .find((v) => v.label === value);

                if (option) {
                    price += Number(option.priceOffSet);
                }
            }
        }

        const total = price * item.quantity;
        subtotal += total;
        items.push({
            productId: product.id,
            productName: product.name,
            productSlug: product.slug,
            quantity: item.quantity,
            unitPrice: price,
            total,
            optionsSnapshot: item.optionsSnapshot,
        });
    }

    return prisma.order.create({
        data: {
            user: {
                connect: { id: userId },
            },
            subtotal,
            shippingCost: 0,
            total: subtotal,
            ...(data.shipping && {
                shipAddress: data.shipping.address,
                shipCity: data.shipping.city,
                shipPostal: data.shipping.postal,
                shipCountry: data.shipping.country,
            }),
            items: {
                create: items,
            },
        },
        include: {
            items: true,
        },
    });
}

export async function getUserOrders(userId: string) {
    return prisma.order.findMany({
        where: { userId },
        include: { items: true, payment: true },
        orderBy: { createdAt: "desc" },
    });
}

export async function getOrderById(orderId: string, userId: string) {
    const order = await prisma.order.findFirst({
        where: { id: orderId, userId },
        include: { items: true, payment: true },
    });

    if (!order) {
        throw new Error("ORDER_NOT_FOUND");
    }

    return order;
}

export async function getAllOrders() {
    return prisma.order.findMany({
        include: {
            user: {
                select: { id: true, email: true, firstName: true, lastName: true },
            },
            items: true,
            payment: true,
        },
        orderBy: { createdAt: "desc" },
    });
}

export async function updateOrderStatus(id: string, data: UpdateOrderStatusInput) {
    return prisma.order.update({
        where: { id },
        data: { status: data.status },
    });
}
