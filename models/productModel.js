const mongoose=require("mongoose");
const user=require('./userModel');
const Category=require('../models/categoryModel');

const productSchema=new mongoose.Schema({
    
    category_id:{
        type:mongoose.Types.ObjectId,
        ref:'categories',
    },
    name_ar:{
        type:String,
        required:true,
        trim:true,
        unique:true,
        minLength:3,
    },
    name_en:{
        type:String,
        required:true,
        trim:true,
        unique:true,
        minLength:3,
    },
    status:{
        type:Boolean,
        default:true
    },
    product_image:{
        type:String,
        default:""
    },
    quantity:{
        type:Number,
        default:1
    },
    onSale:{
        type:Boolean,
        default:false
    },
    price:{
        type:Number,
        require:true
    },
    admin_created_id:{
        type:mongoose.Types.ObjectId,
        ref:'users'
    },
    admin_updated_id:{
        type:mongoose.Types.ObjectId,
        ref:'users'
    }
})
module.exports=mongoose.model("products",productSchema);