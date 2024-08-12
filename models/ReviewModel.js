const mongoose=require('mongoose');
const ReviewSchema=new mongoose.Schema({
    title:{
        type:String,
        trim:true,
    }
    ,
    rating:{
        type:Number,
        min:[1,'the minimum value is 1'],
        max:[5,'the maximum value is 5'],
        required:[true,'the Review cant be empty']
    }
    ,
    userId:{
        type:mongoose.Schema.ObjectId,
        ref:'users'
    }
    ,
    productId:{
        type:mongoose.Schema.ObjectId,
        ref:'products'
    },
    active:{
        type:Boolean,
        default:true
    }
},{timestamps:true});
module.exports=mongoose.model('reviews',ReviewSchema);