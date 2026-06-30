import { prisma } from "../lib/prisma";
import { CreateOptionValueInput, UpdateOptionValueInput } from "./option.types";

export async function createOptionValue(data: CreateOptionValueInput) {
    return prisma.optionValue.create({
        data: {
            label: data.label,
            type: data.type,
            priceOffSet: data.priceOffSet,
        },
    });
}

export async function getOptions() {
    return prisma.optionValue.findMany({
        where: {
            isAvailable: true,
        },
    });
}

export async function updateOptionValue(id: string, data: UpdateOptionValueInput) {
    return prisma.optionValue.update({
        where: {
            id,
        },
        data,
    });
}

export async function disableOption(id: string) {
    return prisma.optionValue.update({
        where: {
            id,
        },
        data: {
            isAvailable: false,
        },
    });
}

// Lie PLUSIEURS options existantes à un produit en une seule fois, dans
// UN SEUL groupe (ex: tout le groupe "tissu" du produit). Remplace l'ancienne
// version qui ne liait qu'une option à la fois.
export async function attachOptionsToProduct(
    productId: string,
    position: number,
    optionValueIds: string[],
) {
    return prisma.productOptionGroup.create({
        data: {
            position,
            product: {
                connect: { id: productId },
            },
            values: {
                connect: optionValueIds.map((id) => ({ id })),
            },
        },
        include: {
            values: true,
        },
    });
}

// Supprime un groupe d'options d'un produit. Les OptionValue centrales
// ne sont PAS supprimées, seulement le lien (le groupe) avec ce produit.
export async function deleteProductOptionGroup(groupId: string) {
    return prisma.productOptionGroup.delete({
        where: { id: groupId },
    });
}
