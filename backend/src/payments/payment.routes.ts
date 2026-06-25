import {Router}
from "express";


import {
createPayment
}
from "./payment.controller";


import {
authMiddleware
}
from "../middleware/auth.middleware";



const router =
Router();



router.post(
"/checkout",
authMiddleware,
createPayment
);



export default router;