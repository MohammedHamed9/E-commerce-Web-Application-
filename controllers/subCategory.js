var slugify = require('slugify')
const SubCategory=require('../models/subCategory');
const Category=require('../models/categoryModel');
const appError = require('../utils/appError');
const subCategoryCtrl={
    createsubCategory:async(req,res,next)=>{
        try{
            const{name,category}=req.body;
            const thecategory=await Category.findById(category);
            if(!thecategory)
                return next(new appError("sorry this category is not found!",400));
            const subCategory=await SubCategory.create(
                {name,slug:slugify(name),category});
                res.status(201).json({
                    message:'the subCategory is created',
                    subCategory
                });
        }catch(error){
            console.log(error);
            next(new appError('somthing went wrong!',500));
        }
    },

}
module.exports=subCategoryCtrl;