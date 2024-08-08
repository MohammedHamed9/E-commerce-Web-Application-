var slugify = require('slugify')
const SubCategory=require('../models/subCategory');
const Category=require('../models/categoryModel');
const appError = require('../utils/appError');
const subCategoryCtrl={
    //cuz the validation layer force me to add the category, 
    //before i go to the function so when i make a subcategory 
    //from category as a nested route i need it 
    setCategoryIdToBody:(req,res,next)=>{
            if(!req.body.category){
                req.body.category=req.params.categoryId;
            }
            next();
    },
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
    getSubCategories:async(req,res,next)=>{
        try{
            const page=parseInt(req.query.page) || 1;
            const limit=parseInt(req.query.limit) || 10;
            const skip=(page-1) * limit;
            let filter={}
            if(req.params.categoryId){
                filter.category=req.params.categoryId;
            }
            const subCategories=await SubCategory.find(filter)
            .limit(limit).skip(skip).populate("category","name -_id")
            .select("-__v");
            const total= await SubCategory.countDocuments();
            const hasprv= page>0 && page!=1;
            const hasNext= page*limit + subCategories.length < total;
            res.status(200).json({
                subCategories,
                paginate:{
                    page,
                    total,
                    hasprv,
                    hasNext,
                },

            })
        }catch(error){
            console.log(error);
            next(new appError('somthing went wrong!',500));
        }
    },
    getSubCategory:async(req,res,next)=>{
        try{
            const subCategoryID=req.params.id;
            const subCategory=await SubCategory.findById(subCategoryID)
            .populate("category","name -_id")
            .select("-__v");
            if(!subCategory)
                return next(new appError('sorry this subCategory is not found!',404));
            res.status(200).json({
                subCategory,
            })
        }catch(error){
            console.log(error);
            next(new appError('somthing went wrong!',500));
        }
    },
    updateSubCategory:async(req,res,next)=>{
        try{
            const subCategoryID=req.params.id;
            const {name,category}=req.body;
            const subCategory=await SubCategory.findByIdAndUpdate(subCategoryID,
                {name,slug:slugify(name),category},{new:true});
            if(!subCategory)
                return next(new appError('sorry this subCategory is not found!',404));
            res.status(200).json({
                message:"ths subcategory is updated",
                subCategory
            });
        }catch(error){
            console.log(error);
            next(new appError('somthing went wrong!',500));
        }
    },
    deleteSubCategory:async(req,res,next)=>{
        try{
            const subCategoryID=req.params.id;
            const subCategory=await SubCategory.findByIdAndDelete(subCategoryID);
            if(!subCategory)
                return next(new appError('sorry this subCategory is not found!',404));
            res.status(203).json({
                message:"done"
            });
        }catch(error){
            console.log(error);
            next(new appError('somthing went wrong!',500));
        }
    }
}
module.exports=subCategoryCtrl;