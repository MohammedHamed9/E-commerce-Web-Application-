const mongoose=require("mongoose");
const User=require("./userModel");
const branch=require('./storeBranchModel');
const store=new mongoose.Schema({
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
    description_ar:{
        type:String,
        trim:true,
        default:''
    },
    description_en:{
        type:String,
        trim:true,
        default:''
    },
    review:{
        type:Number,
        default:1
    },
    status:{
        type:Boolean,
        required:true,
        default:true
    },
    branches:[{
        type:mongoose.Types.ObjectId,
        ref:'storeBranchs',
        default:null
    }],
    admin_created_id:{
        type:mongoose.Types.ObjectId,
        ref:'users',
        default:null

    },
    admin_updated_id:{
        type:mongoose.Types.ObjectId,
        ref:'users',
        default:null
    },
},{
    timestamps:true
});

module.exports=mongoose.model("stores",store);