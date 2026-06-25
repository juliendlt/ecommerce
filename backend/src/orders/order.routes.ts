import {Router}
from "express";


import {
createOrderController
}
from "./order.controller";


import {
authMiddleware
}
from "../middleware/auth.middleware";



const router =
Router();



router.post(
"/",
authMiddleware,
createOrderController
);



export default router;