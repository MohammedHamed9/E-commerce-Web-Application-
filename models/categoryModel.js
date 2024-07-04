const mongoose=require("mongoose");
const appError = require("../utils/appError");
const categorySchema =new mongoose.Schema({
    name_ar:{
        type:String,
        required:true,
        trim:true,
        minLength:3,
        unique:true
    },
    name_en:{
        type:String,
        required:true,
        trim:true,
        minLength:3,
        unique:true

    },
    status:{
        type:Boolean,
        default:true
    },
    category_image:{
        type:String,
        default:"",
        trim:true
    },
    products:[{
        type:mongoose.Types.ObjectId,
        ref:'products',
        default:null
    }],
    admin_created_id:{
        type:mongoose.Types.ObjectId,
        ref:'users'
    },
    admin_update_id:{
        type:mongoose.Types.ObjectId,
        ref:'users'
    }
})
module.exports=mongoose.model("categories",categorySchema);
