import {z} from "zod";


export const updateUserSchema =
z.object({

    firstName:
    z.string()
    .min(2)
    .max(50)
    .optional(),


    lastName:
    z.string()
    .min(2)
    .max(50)
    .optional(),


    email:
    z.string()
    .email()
    .optional()

});



export const updatePasswordSchema =
z.object({

    currentPassword:
    z.string()
    .min(8),


    newPassword:
    z.string()
    .min(8)

});