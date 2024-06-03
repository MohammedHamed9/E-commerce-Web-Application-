const User=require("../models/userModel");
const jwt=require("jsonwebtoken");
const appError = require('../utils/appError');
const crypto=require('crypto');
const util=require('util');
const fs=require('fs');
const fsunlink=util.promisify(fs.unlink);
const EmailCtrl=require('../utils/email');
const signToken=(id)=>{
    const token=jwt.sign({id:id},process.env.JWT_SECRET,
        {expiresIn:process.env.EXPIRED_DATE})
    return token
}
const filterBody=(body,...allowedfields)=>{
    const filteredObject={};
    Object.keys(body).forEach(el=>{
        if(allowedfields.includes(el)) 
        filteredObject[el]=body[el]
    });
    return filteredObject;

}
const createCookie=(token,res)=>{
    const cookieOptions=
    {
        expires:new Date(Date.now()+process.env.COOKIE_EXPIRES_DATE*24*60*60*1000),
        httpOnly:true
    };
    if(process.env.NODE_ENV=='production') cookieOptions.secure=true
    res.cookie('jwt',token,cookieOptions);
}       

const userCtrl=
{
createUser:async(req,res)=>{
    const {name,email,password,phone,role}=req.body;
    const user=await User.create(req.body);
    res.status(201).json({
        message:"the user is created"
    });
},
signUp:async(req,res,next)=>{
    try{
    const {name,email,password,phone}=req.body;
    let avatar="";
    if (req.file && req.file.path) {
        avatar = req.file.path;
    }
    const user=await User.create({name,email,password,phone,avatar});
    //remove the password from response.
    user.password=undefined;

    const token=signToken(user._id);
    createCookie(token,res);
    res.status(201).json({
        message:"welcome to our stores..",
        token,
        user
    })
}catch(err){
    console.log(err)
    next(new appError('somthing went wrong!',500));
}
},
login: async(req,res,next)=>{
    try {
        const {email,password}=req.body;
        if(!email || !password)
            return res.status(500).json({
                message:"please provide your email and password to login!"
                });
        const user=await User.findOne({email:email});
        if(!user || !await user.correctPassword(password,user.password)){
            return res.status(500).json({
                message:"the email or the password is wrong!"
        })
    }
    if(!user.verified){
        return res.status(500).json({
            message:"please verify your account before loging in!"
        })
    }
    const token=signToken(user._id);
    createCookie(token,res);
    res.status(201).json({
        message:"welcome to our stores..",
        token
    })
    } catch (error) {
        console.log(error);
        next(new appError('somthing went wrong!',500));
    }
    
},
logout:(req,res,next)=>{
   res.cookie('jwt','loggedout',{
    expires:new Date (Date.now()+10*1000),
    httpOnly:true
   });
   res.status(200).json({
    message:'loggedout successfully..'
   });
},
//not completed ...try and catch blocks
deleteUser:async(req,res)=>{
    const user=await User.findById(req.params.id);
    if(!user)
    return res.status(500).json({
        message:"this user is not found !"
    });
    const filePath=user.avatar;
    await fsunlink(filePath);
    await User.findByIdAndDelete(user._id);
    res.json({
        message:"the user is deleted.."
    })
},
// need Updating 
verifyAcc:async(req,res,)=>{
    const user=await User.findById(req.params.userId);
    if(!user||req.params.verificationToken!==user.verificationToken){
    return res.status(400).json({
        message:'Invalid credintals provided!'
    });
    }
    user.verified=true;
    user.verificationToken=null;
    await user.save();

},
forgetPassword:async(req,res,next)=>{
    try {
        //1)GET user email and chick on it 
        const email=req.body.email;
        const user=await User.findOne({email});
        if(!user){
            return next(new appError('This user is not found!',404));
        }
        //2) Generat the rest token 
        const resetToken=user.createRestToken();
        await user.save();
        //3) seneding the email
        const restUrl=`${req.get('host')}/api/user/resetPassword/${resetToken}`
        EmailCtrl.sendrestPassEmail(
            "password Reset , Your password reset token (valid for only 10 minutes)"
        ,restUrl,user);
    

        res.status(200).json({
            message:'the email is sent...'
        })
    } catch (err) {
    console.log(err);
    }
},
resetPassword:async(req,res,next)=>{
    try {
        const hashedToken=crypto.
    createHash('sha256').update(req.params.token).digest('hex');
    const user=await User.findOne({
        passwordRestToken:hashedToken,
        passwordRestExpires:{$gte:Date.now()}
    });
    if(!user){
        return next(new appError('Token is invalid or has expired',400));
    }
    //logic to reset the password ....
    const password=req.body.password;
    const passwordConfirm=req.body.passwordConfirm;
    if(password!==passwordConfirm){
        return next(new appError('passwords are not the same',400));
    }
    user.password=password;
    user.passwordRestToken=undefined;
    user.passwordRestExpires=undefined;
    await user.save();
    const token=signToken(user._id);
    createCookie(token,res);
    res.status(200).json({
        message:'the usere is updated..',
        token
    })
    } catch (error) {
        console.log(error);
        next(new appError('somthing went wrong!',500));
    }
    
},
updatePassword:async()=>{

},
updateMe:async(req,res,next)=>{
    try {
    if(req.body.password)
    return(next (new appError(`This route is not for password updates. Please use : ${req.protocol}://${req.get('host')}/api/user/updatePassword`,404)));
    
    const filteredBody=filterBody(req.body,"name","email","phone");
    if(req.file){
        if(req.user.avatar!=""){
            await fsunlink(req.user.avatar);
        }
        filteredBody.avatar=req.file.path;
    }
    console.log(filteredBody);
    const newUser=await User.findOneAndUpdate(req.user._id,filteredBody,{new:true});
    res.status(200).json({
        message:'success',
        newUser
    });
} catch (error) {
        console.log(error);
        next(new appError('somthing went wrong!',500));
    }
},
deleteMe:async(req,res,next)=>{
    try {
        await User.findByIdAndDelete(req.user._id);
        res.status(203).json({
            message:'the user is deleted'
        });
    } catch (error) {
        console.log(error);
        next(new appError('somthing went wrong!',500));
    }
}
}

module.exports=userCtrl
