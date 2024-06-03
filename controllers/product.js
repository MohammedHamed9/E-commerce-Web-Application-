const Product=require('../models/productModel');
const Category=require('../models/categoryModel');
const appError = require('../utils/appError');
const util=require('util');
const fs=require('fs');
const { query } = require('express');
const fsunlink=util.promisify(fs.unlink);

const productCtrl={
    createProduct:async(req,res,next)=>{
        try{
            const category_id=req.body.categoryId;
            if(!category_id){
                return next(new appError('Please provise categoryId field!',400));
            }
            const category=await Category.findById(category_id);
            if(!category){
                return next(new appError('the category is not eist!',400));
            }
            if(req.file){
                req.body.product_image=req.file.path;
            }
            req.body.admin_created_id=req.user._id;
            const product=await Product.create(req.body);
            category.products.push(product._id);
            await category.save();
            res.status(201).json({
                message:'the product is created..',
                product
            });
        }catch(err){
            console.log(err);
            next(new appError('somthing went wrong!',500));
        }
    },
    updateProduct:async(req,res,next)=>{
        try{
            const product=await Product.findById(req.params.id);
            if(!product){
                return next(new appError('the product is not eist!',400));
            }
            if(req.body.categoryId){
                const category=await Category.findById(req.body.categoryId);
                if(!category){
                    return next(new appError('the category is not eist!',400));
                }
            }
            if(req.file){
                if(product.product_image!==""){
                    const filePath=product.product_image;
                    await fsunlink(filePath);   
                    req.body.product_image=req.file.path;
                }else{
                    req.body.product_image=req.file.path;
                }
            }
            req.body.admin_updated_id=req.user._id;
            const updatedProduct=await Product.findByIdAndUpdate(req.params.id,req.body,
                {new:true});
                res.status(201).json({
                    message:'the product is updated..',
                    updatedProduct
                });
        }catch(err){
            console.log(err);
            next(new appError('somthing went wrong!',500));
        }
    },
    getAllProducts:async(req,res,next)=>{
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
                },
                {
                    name_en:{
                        $regex:search,
                        $options:"i"
                    }
                }
            ],
            status:true
        }
        const products=await Product.find(query)
        .populate("category_id","id name_ar name_en status category_image ")
        .select("-__v")
        .sort({_id:1})
        .skip((page-1)*limit)
        .limit(limit);
            const total=await Product.countDocuments(query);
            const hasprv= page>0 && page!==1;
            const hasNext=page*limit+products.length<total;   
            res.status(200).json({
                products,
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
    getProduct:async(req,res,next)=>{
        try{
            const product_id=req.params.id;
            const product=await Product.findById(product_id)
            .populate("category_id","id name_ar name_en status category_image ")
            if(!product_id){
                next(new appError('this product is not exist!',400));
            }
            res.status(200).json({
                product
            })
        }catch(err){
            console.log(err);
            next(new appError('somthing went wrong!',500));
        }
    },
    searchForProduct:async(req,res,next)=>{
        try{
            const page=parseInt(req.query.page,10)||1;
            const limit=parseInt(req.query.limit,10)||10;
            const query=req.query;
            query.status=true;
            const products=await Product.find(query)
            .populate("category_id","id name_ar name_en status category_image ")
            .select('-__v')
            .sort({_id:1})
            .skip((page-1)*limit)
            .limit(limit);
            const total=await Product.countDocuments(query);
            const hasprv= page>0 && page!==1;
            const hasNext=page*limit+products.length<total;   
            res.status(200).json({
                products,
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
    filterPorducts:async(req,res,next)=>{
        try{
            const {category,minPrice,maxPrice,onSale}=req.query;
            const filteredQeury={};
            if(category)
            filteredQeury.category_id=category;
            if(minPrice&&maxPrice)
            filteredQeury.price={$gte:minPrice,$lte:maxPrice};
            if(onSale)
            filteredQeury.onSale=onSale;
            const products=await Product.find(filteredQeury)
            .populate("category_id","id name_ar name_en status category_image ")
            res.status(200).json({
                products
            });
        }catch(err){
            console.log(err);
            next(new appError('somthing went wrong!',500)); 
        }
    }
}
module.exports=productCtrl;