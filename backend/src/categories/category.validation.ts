import {z} from "zod";


export const createCategorySchema =
z.object({

    name:
    z.string()
    .min(2)
    .max(100),


    slug:
    z.string()
    .min(2)
    .regex(/^[a-z0-9-]+$/)

});



export const updateCategorySchema =
createCategorySchema.partial();