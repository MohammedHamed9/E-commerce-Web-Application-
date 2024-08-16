const mongoose=require("mongoose");
const user=require('./userModel')
const product=require('./productModel');
const order =new mongoose.Schema({
    user:{
        type:mongoose.Types.ObjectId,
        ref:'users',
        required:[true,'the order must belong to a user'],
    },
    cartItems:[
        {
        product:{
            type:mongoose.Types.ObjectId,
            ref:'products',
            required:true
        },
        quantity:{
            type:Number,
            required:true
        },
        color:String,
        price:Number
    }],
    
    status:{
        type:String,
        enm:['Pending', 'Processing', 'Dispatched', 'Delivered','Cancelled'],
        default:'Pending'
    },
    
    taxPrice:{
        type:Number,
        default:0
    },
    shippingAddress:{
        type:{
            details: String,
            phone: String,
            city: String,
            postalCode: String,
          },
          required:[true,'the address is required']
    } ,
    shippingPrice:{
        type:Number,
        default:0
    },
    totalOrderPrice: {
        type: Number,
    },
    paymentMethod:{
        type:String,
        enum:['card','cash'],
        default:'cash'
    },
    isPaid:{
        type:Boolean,
        default:false
    },
    paidAt:Date,
    isDelivered:{
        type:Boolean,
        default:false
    },
    deliveredAt:Date
})
module.exports=mongoose.model("orders",order);