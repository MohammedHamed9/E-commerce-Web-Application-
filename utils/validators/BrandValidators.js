const {check,validationResult}=require('express-validator');
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
    createBrandVlidator:[
        check('name').notEmpty()
        .withMessage("the Brand name can't be empty")
        .isLength({min:3})
        .withMessage("the Brand name should be more than 4 characters")
        .isLength({max:32})
        .withMessage("the Brand name can't be more than 32 characters"),
        sendError
    ],
    getBrandVlidator:[
        check('id').isMongoId().withMessage("invalid mongoId"),
        sendError
    ],
}
module.exports=validators;