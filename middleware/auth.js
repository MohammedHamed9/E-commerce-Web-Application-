const jwt=require("jsonwebtoken");
const User=require("../models/userModel");
const authCtrl=
{
protect:async(req,res,next)=>{
    if(!req.headers.authorization || !req.headers.authorization.startsWith("bearer"))
    return res.status(500).json({
        message:"You are not logged in please login!"
    });

    const token =req.headers.authorization.split(" ")[1];
    const decoded=jwt.verify(token,process.env.JWT_SECRET);
    const currentUser= await User.findById(decoded.id);
    if(!currentUser)
    return res.json({
        message:"this user is no longer exist"
    });
    req.user=currentUser;
    next();
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