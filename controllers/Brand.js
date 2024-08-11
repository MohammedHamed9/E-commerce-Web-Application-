var slugify = require('slugify')
const Brand=require('../models/BrandModel');
const appError = require('../utils/appError');
const util=require('util');
const fs=require('fs');
const fsunlink=util.promisify(fs.unlink);
const BrandCtrl={
    createBrand:async(req,res,next)=>{
        try{
            const {name}=req.body;
            const admin_created_id=req.user._id;
            let Brand_image="";
            if(req.file){
                Brand_image=req.file.path;
            }
            const brand=await Brand.create({name,slug:slugify(name),Brand_image,admin_created_id});
            res.status(201).json({
                message:'the brand is created..',
                brand
            });
        }catch(err){
            console.log(err)
            next(new appError('somthing went wrong!',500));
        }
    },
    updateBrand:async(req,res,next)=>{
        try{
            const brand = await Brand.findById(req.params.id);
            if(!brand){
                return next(new appError('the brand is not exist!',404));
            }
            req.body.admin_update_id=req.user._id;
            //console.log(req.file);
            if(req.file){
                if(brand.Brand_image!==""){
                    const filePath=brand.Brand_image;
                    await fsunlink(filePath);   
                    req.body.Brand_image=req.file.path;
                }else{
                    req.body.Brand_image=req.file.path;
                }
            }
            if(req.body.name){
                req.body.slug=slugify(req.body.name);    
            }
        const updatedBrand= await Brand.findByIdAndUpdate(req.params.id,
            req.body,
            {new:true});
            res.status(200).json({
                message:'the Brand is updated..',
                updatedBrand
            });
        }catch(err){
            console.log(err)
            next(new appError('somthing went wrong!',500));
        }
    },
    getBrand:async(req,res,next)=>{
        try{
        const brand_Id=req.params.id;
        const brand=await Brand.findById(brand_Id)
        if(!brand){
            return next(new appError('this brand is not exist!',404));
        }
        res.status(200).json({
            brand
        })
    }catch(err){
        console.log(err);
        next(new appError('somthing went wrong!',500));
    }
    },
    getBrands:async(req,res,next)=>{
        try{
        //1)pagination
        const page=parseInt(req.query.page,10)||1;
        const limit=parseInt(req.query.limit,10)||10;
        const skip=(page-1) * limit ;
        //2)preparing filtering
        const queryObj={...req.query}
        const exculdedFields=['page','limit','sort','fields','search']
        exculdedFields.forEach((field) => delete queryObj[field]);
        
        
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
        let query=queryObj
        if(req.query.search){
            query.$or=[
                {name:{$regex : req.query.search,$options:'i'}},
                {description:{$regex:req.query.search,$options:'i'}}
            ]
        }
            
            const brands=await Brand.find(query)
            .select(fields)
            .sort(sortBy)
            .skip(skip)
            .limit(limit)

            const total=await Brand.countDocuments();
            const hasprv= page>0 && page!==1;
            const hasNext= page*limit + brands.length <total;   
            res.status(200).json({
                brands,
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
    
    deleteBrand:async(req,res,next)=>{
        try{
            const filter=req.body.filter;
            await Brand.deleteMany({_id: {$in:filter }});
            res.status(204).json({
                message:"done"});
        }
        catch(error){
            console.log(error);
            next(new appError('somthing went wrong!',500));
        }
    }
}
module.exports=BrandCtrl;