const mongoose=require("mongoose");
const appError = require("../utils/appError");
const BrandSchema =new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true,
        minLength:3,
        unique:true
    },
    slug:{
        type:String,
        lowercase:true
    },
    status:{
        type:Boolean,
        default:true
    },
    Brand_image:{
        type:String,
        default:"",
        trim:true
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
module.exports=mongoose.model("brands",BrandSchema);
