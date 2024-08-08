const {check,validationResult}=require('express-validator');
const sendError=(req,res,next)=>{
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({error:errors.array()});
    }

    next();
}
const validators={
    createsubCategory:[
        check('name').notEmpty()
        .withMessage('the subCategory name cant be empty!')
        .isLength({min:3})
        .withMessage('the subCategory name cant be less than or equal to 3 characters')
        ,check('category').notEmpty()
        .withMessage('the subCategory must belong to a category')
        .isMongoId()
        .withMessage('Invalid MongoId!'),
        sendError
    ],
    getSubCategory:[
        check('id').isMongoId()
        .withMessage("Invalid MongoId! "),
        sendError
    ]
}
module.exports=validators;