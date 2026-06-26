import { OrderStatus } from "@prisma/client";

export type CreateOrderInput = {
    items: {
        productId: string;
        productName: string;
        productSlug: string;
        quantity: number;
        unitPrice: number;
        optionsSnapshot?: Record<string, string>;
    }[];

    shipping?: {
        address: string;
        city: string;
        postal: string;
        country: string;
    };
};

export type UpdateOrderStatusInput = {
    status: OrderStatus;
};
