import {prisma}
from "../lib/prisma";


import {
CreateOptionValueInput,
UpdateOptionValueInput
}
from "./option.types";





export async function createOptionValue(
data:CreateOptionValueInput
){


return prisma.optionValue.create({

data:{

 label:data.label,

 type:data.type,

 priceOffSet:data.priceOffSet

}

});


}






export async function getOptions(){


return prisma.optionValue.findMany({

where:{

 isAvailable:true

}

});


}






export async function updateOptionValue(
id:string,
data:UpdateOptionValueInput
){


return prisma.optionValue.update({

where:{
 id
},


data

});


}







export async function disableOption(
id:string
){


return prisma.optionValue.update({

where:{
 id
},


data:{

 isAvailable:false

}

});


}






export async function attachOptionToProduct(
productId:string,
optionValueId:string,
position:number
){



return prisma.productOptionGroup.create({

data:{


position,


product:{

 connect:{
  id:productId
 }

},



values:{

 connect:{
  id:optionValueId
 }

}


}


});


}