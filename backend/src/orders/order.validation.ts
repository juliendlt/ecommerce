import {z} from "zod";


export const createOrderSchema =
z.object({

items:

z.array(

 z.object({

  productId:
  z.string(),

  productName:
  z.string(),

  productSlug:
  z.string(),

  quantity:
  z.number().int().positive(),

  unitPrice:
  z.number().positive(),

  optionsSnapshot:
  z.record(z.string())
  .optional()

 })

).min(1),



shipping:
z.object({

 address:z.string(),

 city:z.string(),

 postal:z.string(),

 country:z.string()

}).optional()

});