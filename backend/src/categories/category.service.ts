import { prisma } from "../lib/prisma";
import { CreateCategoryInput, UpdateCategoryInput } from "./category.types";

export async function createCategory(data: CreateCategoryInput) {
    const existing = await prisma.category.findUnique({
        where: {
            slug: data.slug,
        },
    });

    if (existing) {
        throw new Error("CATEGORY_ALREADY_EXISTS");
    }

    return prisma.category.create({ data });
}

export async function getCategories() {
    return prisma.category.findMany({
        orderBy: {
            name: "asc",
        },
    });
}

export async function getCategoryBySlug(slug: string) {
    const category = await prisma.category.findUnique({
        where: {
            slug,
        },
        include: {
            products: {
                where: {
                    isActive: true,
                },
                include: {
                    images: true,
                },
            },
        },
    });

    if (!category) {
        throw new Error("CATEGORY_NOT_FOUND");
    }

    return category;
}

export async function updateCategory(id: string, data: UpdateCategoryInput) {
    return prisma.category.update({
        where: {
            id,
        },
        data,
    });
}

export async function deleteCategory(id: string) {
    return prisma.category.delete({
        where: {
            id,
        },
    });
}
