const jwt=require("jsonwebtoken");
const User=require("../models/userModel");
const appError=require('../utils/appError');
const authCtrl=
{
protect:async(req,res,next)=>{
    try{
        if(!req.headers.authorization || !req.headers.authorization.startsWith("Bearer"))
            return res.status(401).json({
                message:"You are not logged in please login!"
            });
        
            const token =req.headers.authorization.split(" ")[1];
            const decoded=jwt.verify(token,process.env.JWT_SECRET);
            const currentUser= await User.findById(decoded.id);
            if(!currentUser || currentUser.active==false)
            return res.json({
                message:"this user is no longer exist"
            });
            //to check if the user has changed the password
            if(currentUser.passwordChangedAt){
                let passwordChangedAtTimeStamp=
               parseInt(currentUser.passwordChangedAt.getTime()/1000,10);
               if(passwordChangedAtTimeStamp>decoded.iat){
                return next(new appError('your changed your password, please log in agian!',401))

               }
               
            }
            req.user=currentUser;
            next();
    }
    catch(error){
        if(error.name==='TokenExpiredError')
        return res.status(401).json({
            message:"Your session has expired. Please log in again."
        });
        
        return res.status(401).json({
            message: "Invalid token. Please log in again.",
        })
    }
    
},
restrictedTo:(...roles)=>{
    return (req,res,next)=>{
        if(!roles.includes(req.user.role))
        return res.status(403).json({
            message:"SORRY U CANT ACCESS THIS ROUTE !"
        });
        next();
    }
}
}
module.exports=authCtrl;