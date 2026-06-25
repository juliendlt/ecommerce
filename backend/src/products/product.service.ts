import { prisma } from "../lib/prisma";
import { CreateProductInput, UpdateProductInput } from "./product.types";


export async function createProduct(
    data: CreateProductInput
) {
    return prisma.product.create({
        data: {
            name: data.name,
            slug: data.slug,
            shortDescription: data.shortDescription,
            description: data.description,
            basePrice: data.basePrice,
            category: {
                connect: {
                    id: data.categoryId
                }
            }
        }
    });
}

export async function getProducts() {
    return prisma.product.findMany({
        where: {
            isActive: true
        },
        include: {
            images: true,
            category: true,
            optionGroups: {
                include: {
                    values: true
                }
            }
        }
    });
}


export async function getProductBySlug(
    slug: string
) {
    const product =
        await prisma.product.findUnique({
            where: {
                slug
            },
            include: {
                images: true,
                category: true,
                optionGroups: {
                    include: {
                        values: true
                    }
                }
            }
        });

    if (!product) {
        throw new Error("PRODUCT_NOT_FOUND");
    }

    return product;
}


export async function updateProduct(
    id: string,
    data: UpdateProductInput
) {
    return prisma.product.update({
        where: {
            id
        },
        data
    });
}




export async function disableProduct(
    id: string
) {
    return prisma.product.update({
        where: {
            id
        },
        data: {
            isActive: false
        }
    });
}