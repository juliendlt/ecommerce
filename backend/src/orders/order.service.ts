import {prisma}
from "../lib/prisma";



export async function createOrder(
userId:string,
data:any
){


let subtotal = 0;



const orderItems = [];



for(
const item of data.items
){


const product =
await prisma.product.findUnique({

where:{
 id:item.productId
},


include:{

 optionGroups:{

  include:{

   values:true

  }

 }

}

});



if(!product){

throw new Error(
"PRODUCT_NOT_FOUND"
);

}




let finalPrice =
Number(product.basePrice);




// calcul options

if(item.optionsSnapshot){


for(
const optionName
of Object.values(
item.optionsSnapshot
)
){


const option =
product.optionGroups
.flatMap(
g=>g.values
)
.find(
v=>v.label===optionName
);



if(option){

finalPrice +=
Number(option.priceOffSet);

}


}

}



const total =
finalPrice *
item.quantity;



subtotal += total;



orderItems.push({

 productId:
 product.id,


 productName:
 product.name,


 productSlug:
 product.slug,


 quantity:
 item.quantity,


 unitPrice:
 finalPrice,


 total,


 optionsSnapshot:
 item.optionsSnapshot

});


}





const order =
await prisma.order.create({

data:{


user:{

connect:{
 id:userId
}

},


subtotal,


shippingCost:0,


total:subtotal,



items:{

create:
orderItems

}



},



include:{
items:true
}

});



return order;


}