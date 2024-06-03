const { query } = require('express');
const Category=require('../models/categoryModel');
const appError = require('../utils/appError');
const util=require('util');
const fs=require('fs');
const fsunlink=util.promisify(fs.unlink);
const categoryCtrl={
    createCategory:async(req,res,next)=>{
        try{
            const {name_ar,name_en,products}=req.body;
            const admin_created_id=req.user._id;
            let category_image="";
            if(req.file){
                category_image=req.file.path;
            }
            const category=await Category.create({name_ar,name_en,category_image,products,admin_created_id});
            res.status(201).json({
                message:'the category is created..',
                category
            });
        }catch(err){
            console.log(err)
            next(new appError('somthing went wrong!',500));
        }
    },
    updateCategory:async(req,res,next)=>{
        try{
            const category = await Category.findById(req.params.id);
            if(!category){
                return next(new appError('the category is not exist!',404));
            }
            req.body.admin_update_id=req.user._id;
            console.log(req.file);
            if(req.file){
                if(category.category_image!==""){
                    const filePath=category.category_image;
                    await fsunlink(filePath);   
                    req.body.category_image=req.file.path;
                }else{
                    req.body.category_image=req.file.path;
                    
                }
            }
            
        const updatedCategory= await Category.findByIdAndUpdate(req.params.id,
            req.body,
            {new:true});
            res.status(200).json({
                message:'the category is updated..',
                updatedCategory
            });
        }catch(err){
            console.log(err)
            next(new appError('somthing went wrong!',500));
        }
    },
    getCategory:async(req,res,next)=>{
        try{const category_Id=req.params.id;
        const category=await Category.findById(category_Id)
        .populate("products","_id name_ar name_en status product_imge quantity onSale price");
        if(!category){
            return next(new appError('this category is not exist!',404));
        }
        res.status(200).json({
            category
        })
    }catch(err){
        console.log(err);
        next(new appError('somthing went wrong!',500));
    }
    },
    getCategories:async(req,res,next)=>{
        try{
            const page=parseInt(req.query.page,10)||1;
            const limit=parseInt(req.query.limit,10)||10;
            const search=req.query.search||"";
            const query={
                $or:[
                    {
                    name_ar:{
                        $regex:search,
                        $options:"i"
                    }
                },{
                    name_en:{
                        $regex:search,
                        $options:"i"
                    }
                }
                ],
                status:true
            };
            
            const categories=await Category.find(query)
            .populate("products","_id name_ar name_en status product_imge quantity onSale price")
            .select("-__v")
            .sort({_id:1})
            .skip((page-1)*limit)
            .limit(limit)

            const total=await Category.countDocuments(query);
            const hasprv= page>0 && page!==1;
            const hasNext=page*limit+categories.length<total;   
            res.status(200).json({
                categories,
                paginate:{
                    page,
                    total,
                    hasprv,
                    hasNext,
                }
            })
        }catch(err){
            console.log(err);
            next(new appError('somthing went wrong!',500));
        }
    },
    //NOT IMPLEMENTED YET
    deleteCtegory:async(req,res,next)=>{}
}
module.exports=categoryCtrl;