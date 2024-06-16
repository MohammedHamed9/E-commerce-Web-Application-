const mongoose=require("mongoose");
const emailValidator=require("email-validator");
const bcrypt=require("bcrypt");
const crypto=require('crypto');
const UserSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true,
        minLength:3
    }, 
    email:{
        type:String,
        required:true,
        trim:true,
        lowercase:true,
        unique:true,
        validate:{
            validator:emailValidator.validate,
            message:props=>{`${props.value} is not a valid email address!`}
        }
    },
    password:{
        type:String,
        required:true,
        trim:true,
        minLength:8
    },
    phone:{
        type:String,
        required:true,
        trim:true,
        unique:true
    },
    role:{
        type:Number,//0 for user 1 for admin 
        default:0
    },
    avatar:{
        type:String,
        default:""
    },
    cart:{
       products:[
        {
        product:{
            type:mongoose.Schema.ObjectId,
            ref:'products'
        },
        quantity:{
            type:Number,
            default:1
        }
       }
       ]
    },
    favorite_items:{
        products:[
            {
            product:{
                type:mongoose.Schema.ObjectId,
                ref:'products'
            }
            }
        ]
    },
    verified:{
        type:Boolean,
        default:false
    },
    verificationToken:{
        type:Number,
        index:true,
        unique:true,
    },
    passwordRestToken:String,
    passwordRestExpires:Date,
},{
    timestamps:true
});

UserSchema.pre('save',async function(next){
    if(!this.isModified('password'))return next();
    this.password=await bcrypt.hash(this.password,12);
    next();
})

UserSchema.methods.correctPassword=async function(addedPass,truePass){
    const flag =await bcrypt.compare(addedPass,truePass);
    return flag
};
UserSchema.methods.createRestToken=function(){
    const restToken=crypto.randomBytes(32).toString("hex");
    this.passwordRestToken=crypto.
    createHash('sha256').update(restToken).digest('hex');
    this.passwordRestExpires=Date.now()+ 10*60*1000 //10mins
    return restToken;
};

module.exports=mongoose.model("users",UserSchema);