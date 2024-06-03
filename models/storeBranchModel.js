const mongoose=require("mongoose");

const storeBranch=new mongoose.Schema({
    store_id:{
        type:mongoose.Types.ObjectId,
        ref:'stores'
    },
    address_ar:{
        type: String,
        required:true,
        trim:true,
    },
    address_en:{
        type: String,
        required:true,
        trim:true,
    },
    working_hours_from:{
        type:Number,
        required:true
    },
    working_hours_to:{
        type:Number,
        required:true
    },
    status:{
        type:Boolean,
        default:true
    },
    phone:{
        type:String,
        required:true,
        trim:true,
        unique:true
    },
    categories:[{
        type:mongoose.Types.ObjectId,
        ref:'categories',
        default:null
    }],
    products:[{
        product:{
        type:mongoose.Types.ObjectId,
        ref:'products',
        default:null
    },
        quantity:{
            type:Number,
            required:true
        }
        
    }],
    admin_created_id:{
        type:mongoose.Types.ObjectId,
        ref:'users',
    },
    admin_update_id:{
        type:mongoose.Types.ObjectId,
        ref:'users',
        default:null
    }
},{
    timestamps:true
});
storeBranch.index({store_id:1 ,address_ar:1},{unique:true});
module.exports=mongoose.model("storeBranchs",storeBranch);