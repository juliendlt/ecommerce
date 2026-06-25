import {z} from "zod";


export const createOptionSchema =
z.object({

 label:
 z.string()
 .min(1),


 type:
 z.string()
 .min(1)
 .max(50),


 priceOffSet:
 z.number()
 .min(0)

});



export const updateOptionSchema =
z.object({

 label:
 z.string()
 .min(1)
 .optional(),


 type:
 z.string()
 .min(1)
 .max(50)
 .optional(),


 priceOffSet:
 z.number()
 .positive()
 .optional(),


 isAvailable:
 z.boolean()
 .optional()

});