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
    createProductVlidator:[
        check('name').notEmpty()
        .withMessage("the prodcuct name can't be empty")
        .isLength({min:3})
        .withMessage("the prodcuct name should be more than 4 characters")
        .isLength({max:200})
        .withMessage("the prodcuct name can't be more than 200 characters"),

        check('description').notEmpty()
        .withMessage("the prodcuct description can't be empty")
        .isLength({min:10})
        .withMessage("the prodcuct description should be more than 10 characters"),
        
        check('price').notEmpty()
        .withMessage("the prodcuct price can't be empty")
        .isNumeric()
        .withMessage("the prodcuct price must be numerical value"),

        check('priceAfterDiscount').optional().isNumeric()
        .withMessage("the prodcuct priceAfterDiscount must be numerical value")
        .toFloat()
        .custom((value,{req})=>{
            if(req.body.price<=value){
                throw new Error('the priceAfterDiscount cant be greater than the price')
            }
            return true;
        })
        ,
        
        check('category').notEmpty()
        .withMessage('the product must belong to a category') 
        .isMongoId().withMessage("invalid mongoId"),
        
        check('subcategory').optional().isMongoId().withMessage("invalid mongoId"),
        
        check('brand').optional().isMongoId().withMessage("invalid mongoId")
        ,sendError
    ],
    getProductVlidator:[
        check('id').isMongoId().withMessage("invalid mongoId"),
        sendError
    ],
}
module.exports=validators;
