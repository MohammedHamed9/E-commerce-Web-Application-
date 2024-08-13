const mongoose=require("mongoose");
const CouponSchema =new mongoose.Schema({
    name:{
        type:String,
        required:[true,'the coupon must has a name'],
        trim:true,
        minLength:3,
        unique:true
    },
    expire:{
        type:Date,
        required:[true,'the coupon must has a expire dare'],
    },
    discount:{
        type:Number,
        required:[true,'the coupon must has a discount amount'],
    },
    active:{
        type:Boolean,
        default:true
    },
    admin_created_id:{
        type:mongoose.Types.ObjectId,
        ref:'users'
    },
    admin_update_id:{
        type:mongoose.Types.ObjectId,
        ref:'users',
    }
},{timestamps:true});
module.exports=mongoose.model("coupons",CouponSchema);
