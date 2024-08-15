const {check,validationResult}=require('express-validator');
const appError = require('../appError');
const User=require('../../models/userModel');
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
    createUserVlidator:[
        check('name').notEmpty()
        .withMessage("the user name can't be empty")
        .isLength({min:2})
        .withMessage("the user name should be more than 2 characters")
        .isLength({max:32})
        .withMessage("the user name can't be more than 32 characters"),
        
        check('email').notEmpty()
        .withMessage("the email can't be Empty")
        .isEmail().withMessage('invalid Email')
        .custom((val) =>
            User.findOne({email:val}).then((user)=>{
                if(user){
                    return Promise.reject(new appError('E-mail already in use',400))
                }
            })
        ),
        check('password').notEmpty()
        .withMessage("Password is required")
        .isLength({min:2})
        .withMessage("the password should be more than 2 characters")
        .isLength({max:32})
        .withMessage("the password can't be more than 32 characters"),
        
        check('phone').isMobilePhone("ar-EG")
        .withMessage('Invalid phone number only accepted Egy Phone numbers')
        ,sendError
    ],
    getUserVlidator:[
        check('id').isMongoId().withMessage("invalid mongoId"),
        sendError
    ],
}
module.exports=validators;
