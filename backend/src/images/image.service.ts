import { prisma } from "../lib/prisma";
import { CreateImageInput, UpdateImageInput } from "./image.types";

export async function createImage(data: CreateImageInput) {
    return prisma.productImage.create({
        data: {
            url: data.url,
            alt: data.alt,
            position: data.position,
            product: {
                connect: {
                    id: data.productId,
                },
            },
            optionValue: data.optionValueId
                ? {
                      connect: {
                          id: data.optionValueId,
                      },
                  }
                : undefined,
        },
    });
}

export async function getProductImages(productId: string) {
    return prisma.productImage.findMany({
        where: {
            productId,
        },
        include: {
            optionValue: true,
        },
        orderBy: {
            position: "asc",
        },
    });
}

export async function updateImage(id: string, data: UpdateImageInput) {
    return prisma.productImage.update({ where: { id }, data });
}

export async function deleteImage(id: string) {
    return prisma.productImage.delete({ where: { id } });
}
