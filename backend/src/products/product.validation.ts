import { z } from "zod";

export const createProductSchema = z.object({
    name: z.string().min(2),
    slug: z.string().min(2),
    shortDescription: z.string().optional(),
    description: z.string().optional(),
    basePrice: z.number().positive(),
    categoryId: z.string(),
});

export const updateProductSchema = createProductSchema.partial().extend({
    isActive: z.boolean().optional(),
});
