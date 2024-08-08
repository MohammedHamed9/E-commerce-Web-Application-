const Product=require('../models/productModel');
const Category=require('../models/categoryModel');
const Subcategory=require('../models/subCategory');
const Brand=require('../models/BrandModel');
const appError = require('../utils/appError');
const util=require('util');
const fs=require('fs');
const { query } = require('express');
const { default: slugify } = require('slugify');
const fsunlink=util.promisify(fs.unlink);

const productCtrl={
    createProduct:async(req,res,next)=>{
        try{
            const category_id=req.body.category;
            
            const category=await Category.findById(category_id);
            if(!category){
                return next(new appError('the category is not exist!',400));
            }
            if(req.body.subcategory){
            const subcategories=req.body.subcategory;
            let flag=0;
            for (let i=0 ; i<subcategories.length ; i++){
            const subcat=await Subcategory.findById(subcategories[i]);
            console.log(subcat);
            if(!subcat){
                return next(new appError(`this subcategory: ${subcategories[i]} is not exist!`,400));    
            }
            if (subcat.category != category_id)
                return next(new appError(`this subcategory: ${subcategories[i]} is not belong to this category ${category_id} !`,400));    
            }
            
        }
        if(req.body.brand){
            const brand=await Brand.findById(req.body.brand);
            if(!brand){
                return next(new appError('the brand is not exist!',400));
            }
        }
            if(req.file){
                req.body.product_image=req.file.path;
            }
            req.body.admin_created_id=req.user._id;
            req.body.slug=slugify(req.body.name);
            const product=await Product.create(req.body);
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
                return next(new appError('the product is not exist!',400));
            }
            if(req.body.category){
                const category=await Category.findById(req.body.category);
                if(!category){
                    return next(new appError('the category is not exist!',400));
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
            if(req.body.name){
                req.body.slug=slugify(req.body.name);
            }
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
        //1)pagination
        const page=parseInt(req.query.page,10)||1;
        const limit=parseInt(req.query.limit,10)||10;
        const skip=(page-1) * limit ;
        //2)preparing filtering
        const queryObj={...req.query}
        const exculdedFields=['page','limit','sort','fields','search']
        exculdedFields.forEach((field) => delete queryObj[field]);
        
        //ADD $ to the querystr
        let queryStr=JSON.stringify(queryObj);
        queryStr=queryStr.replace(/\b(gte|gt|lte|lt)\b/g,match=> `$${match}`);
        
        //3)preparing sort 
        let sortBy
        if(req.query.sort){
         sortBy=req.query.sort.split(",").join(" ");
    }
    else{
         sortBy="createdAt"
    }
        //4)preparing to retrev some fields only
        let fields="";
        if(req.query.fields){
            fields=req.query.fields;
            fields=fields.split(",").join(" ");
        }else{
            fields="-__v"
        }
        //5)Search
        let query=JSON.parse(queryStr)
        if(req.query.search){
            query.$or=[
                {name:{$regex : req.query.search,$options:'i'}},
                {description:{$regex:req.query.search,$options:'i'}}
            ]
        }
        
        const products=await Product.find(query)
        .populate("category","name status -_id")
        .populate("subcategory","name -_id")
        .populate("brand","name status -_id")
        .select(fields)
        .sort(sortBy)
        .skip(skip)
        .limit(limit);
            const total=await Product.countDocuments();
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
            .populate("category","name status -_id")
            .populate("subcategory","name -_id")
            .populate("brand","name status -_id")
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
    },
    deleteProduct:async(req,res,next)=>{
        try{
            //check if the product exists
            const productId=req.params.id;
            const product=await Product.findById(productId);
            if(!product){
                return next(new appError('sorry this product is not exists!',404));
            }
            /*//find all users the has that product in the cart
            await User.updateMany({
                'cart.products.product':productId},
                {$pull:{'cart.products':{ product:productId}}});
                await User.updateMany({
                    'favorite_items.products.product':productId},
                    {$pull:{'favorite_items.products':{ product:productId}} });
            //delete it from the category
            const categoryId=product.category_id;
            
            const category=await Category.findById(categoryId);
            console.log(category.products)
            category.products=category.products.filter(el=>el!=productId);
            console.log(category.products)

            await category.save();*/
            //delete the product
            await Product.findByIdAndDelete(productId);
            res.status(204).json({
                message:'done'
            })
        }catch(error){
            console.log(err);
            next(new appError('somthing went wrong!',500)); 
        }
    }
}
module.exports=productCtrl;