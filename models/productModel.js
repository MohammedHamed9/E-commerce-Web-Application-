const mongoose=require("mongoose");
const user=require('./userModel');
const Category=require('../models/categoryModel');

const productSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,'the product must has a name!'],
        trim:true,
        unique:true,
        minLength:3,
    },
    slug:{
        type:String,
        trim:true,
        unique:true,
        lowercase:true
    },
    status:{
        type:Boolean,
        default:true
    },
    description:{
        type:String,
        trim:true,
        required:[true,'the product must has a description!'],
    },
    image_cover:{
        type:String,
        //required:[true,'the product must has at least one image!'],
    },
    product_images:{
        type:[String]
    },
    quantity:{
        type:Number,
        default:1
    },
    sold:{
        type:Number,
        default:0
    },
    price:{
        type:Number,
        require:[true,'the product must has a price!'],
    },
    priceAfterDiscount:{
        type:Number
    },
    colors:{
        type:[String]
    },
    onSale:{
        type:Boolean,
        default:false
    },
    category:{
        type:mongoose.Types.ObjectId,
        ref:'categories',
    },
    subcategory:[{
        type:mongoose.Schema.ObjectId,
        ref:'subcategories'
    }],
    brand:{
        type:mongoose.Schema.ObjectId,
        ref:'brands'
    },
    rating:{
        type:Number,
        min:[1,'the rating must be belong than 1'],
        max:[5,'the rating must be less than or equal to 5']
    },
    ratingQuantity:{
        type:Number,
        default:0
    },
    admin_created_id:{
        type:mongoose.Types.ObjectId,
        ref:'users'
    },
    admin_updated_id:{
        type:mongoose.Types.ObjectId,
        ref:'users'
    }
},{timestamps:true,
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
});
productSchema.virtual("reviews",{
    ref:'reviews',
    foreignField:'productId',
    localField:'_id'
});
module.exports=mongoose.model("products",productSchema);