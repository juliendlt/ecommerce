import { z } from "zod";


export const createImageSchema = z.object({
    productId: z.string(),
    url: z.string().url(),
    alt: z.string().optional(),
    position: z.number().int().min(0),
    optionValueId: z.string().optional()
});



export const updateImageSchema = z.object({
    url: z.string().url().optional(),
    alt: z.string().optional(),
    position: z.number().int().optional(),
    optionValueId: z.string().optional()
});