const mongoose=require("mongoose");
const user=require('./userModel')
const branch=require('./storeBranchModel');
const product=require('./productModel');
const order =new mongoose.Schema({
    products:[{
        product:{
            type:mongoose.Types.ObjectId,
            ref:'products',
            required:true
        },
        quantity:{
            type:Number,
            required:true
        }
    }],
    customer_id:{
        type:mongoose.Types.ObjectId,
        ref:'users',
        required:true,
    },
    status:{
        type:String,
        enm:['Pending', 'Processing', 'Dispatched', 'Delivered','Cancelled'],
        default:'Pending'
    },
    date:{
        type:Date,
        default:Date.now
    },
    totalAmount:{
        type:Number,
    },
    branch_id:{
        type:mongoose.Types.ObjectId,
        ref:'storeBranchs'
    }
})
module.exports=mongoose.model("orders",order);