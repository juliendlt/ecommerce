import { prisma } from "../lib/prisma";
import {
 hashPassword,
 comparePassword
} from "../utils/password";
import {
 generateToken
} from "../lib/jwt";


export async function register(data:{
 email:string;
 password:string;
 firstName:string;
 lastName:string;
}){


 const existing =
 await prisma.user.findUnique({
  where:{
   email:data.email
  }
 });


 if(existing){
  throw new Error("EMAIL_ALREADY_EXISTS");
 }


 const password =
 await hashPassword(data.password);


 const user =
 await prisma.user.create({
  data:{
   email:data.email,
   password,
   firstName:data.firstName,
   lastName:data.lastName,
  }
 });


 const token =
 generateToken({
  id:user.id,
  role:user.role
 });


 return {
  user:{
   id:user.id,
   email:user.email,
   firstName:user.firstName,
   lastName:user.lastName,
   role:user.role
  },
  token
 };

}



export async function login(
 email:string,
 password:string
){

 const user =
 await prisma.user.findUnique({
  where:{email}
 });


 if(!user){
  throw new Error("INVALID_LOGIN");
 }


 const valid =
 await comparePassword(
  password,
  user.password
 );


 if(!valid){
  throw new Error("INVALID_LOGIN");
 }


 const token =
 generateToken({
  id:user.id,
  role:user.role
 });


 return {
  user:{
   id:user.id,
   email:user.email,
   role:user.role
  },
  token
 };
}