const mongoose=require("mongoose");
const CartSchema =new mongoose.Schema({
    cart_items:[
         {
         product:{
             type:mongoose.Schema.ObjectId,
             ref:'products'
         },
         quantity:{
             type:Number,
             default:1
         },
         color:String,
         price:Number
        }
        ],
    totalPrice:Number,
    totalPriceAfterDiscount:{
        type:Number,
        default:0
    },
    user:{
        type:mongoose.Schema.ObjectId,
        ref:"users"
     }   
     
},{timestamps:true});
module.exports=mongoose.model("carts",CartSchema);
