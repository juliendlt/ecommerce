import {Router}
from "express";


import {

getMe,
updateMe,
updateMyPassword

}
from "./user.controller";


import {
authMiddleware
}
from "../middleware/auth.middleware";



const router =
Router();



router.get(

"/me",

authMiddleware,

getMe

);




router.put(

"/me",

authMiddleware,

updateMe

);




router.put(

"/password",

authMiddleware,

updateMyPassword

);



export default router;