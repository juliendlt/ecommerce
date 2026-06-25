import Stripe from "stripe";
import {Request,Response}
from "express";

import {prisma}
from "../lib/prisma";


const stripe =
new Stripe(
process.env.STRIPE_SECRET_KEY!
);



export async function stripeWebhook(
req:Request,
res:Response
){



const signature =
req.headers[
"stripe-signature"
] as string;



let event;



try{


event =
stripe.webhooks.constructEvent(

req.body,

signature,

process.env
.STRIPE_WEBHOOK_SECRET!

);



}catch{


return res
.status(400)
.send("Invalid signature");


}




if(
event.type==="checkout.session.completed"
){


const session = event.data.object as Stripe.Checkout.Session;

const orderId =
session.metadata!
.orderId;



await prisma.payment.update({

where:{

stripeSessionId:
session.id

},


data:{


status:
"SUCCEEDED",


paidAt:
new Date(),


stripePaymentId: session.payment_intent as string

}


});



await prisma.order.update({

where:{
id:orderId
},


data:{

status:
"PAID"

}

});



}



res.json({
received:true
});


}