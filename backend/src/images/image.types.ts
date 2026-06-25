export type CreateImageInput = {

 productId:string;

 url:string;

 alt?:string;

 position:number;

 optionValueId?:string;

};


export type UpdateImageInput = {

 url?:string;

 alt?:string;

 position?:number;

 optionValueId?:string;

};