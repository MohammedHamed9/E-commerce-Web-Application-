const {check,validationResult,param}=require('express-validator');
const appError = require('../appError');
    const sendError=
(req,res,next)=>{
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({
            error:errors.array()
        })
    }
    next();
} 
const validators={
    createReviewVlidator:[
        check('rating').notEmpty().withMessage("the Review can't be empty")
        ,sendError
    ],
    getReviewVlidator:[
        check('id').isMongoId().withMessage("invalid mongoId"),
        sendError
    ],
}
module.exports=validators;