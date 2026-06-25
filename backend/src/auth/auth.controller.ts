import {Request,Response} from "express";

import {
 register,
 login
} from "./auth.service";

import {
 registerSchema,
 loginSchema
} from "./auth.validation";



export async function registerController(
req:Request,
res:Response
){

 try{

 const data =
 registerSchema.parse(req.body);


 const result =
 await register(data);


 res.status(201).json(result);


 }catch(e:any){

 res.status(400).json({
  message:e.message
 });

 }

}



export async function loginController(
req:Request,
res:Response
){

 try{

 const data =
 loginSchema.parse(req.body);


 const result =
 await login(
  data.email,
  data.password
 );


 res.json(result);


 }catch(e:any){

 res.status(401).json({
  message:e.message
 });

 }

}