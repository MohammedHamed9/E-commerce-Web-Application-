const mongoose=require('mongoose')
const Review=require('../models/ReviewModel');
const appError = require('../utils/appError');
const Product=require("../models/productModel");
const ReviewCtrl={
    clacStatics:async(productId)=>{
        const stats= Review.aggregate([
            {
                $match:  {productId: new mongoose.Types.ObjectId(productId),active:true} 
            },
            {
                $group:{
                   _id:'productId',
                   avgRating:{$avg:'$rating'},
                   ratingQuantity:{$sum:1}
                }
            }
        ])
        return stats;
},
    createReview:async(req,res,next)=>{
        try{
            req.body.productId=req.params.ProdId
            req.body.userId=req.user._id;
            const oldReview=await Review.findOne({userId:req.user._id,productId:req.params.ProdId});
            if(oldReview){
                return next(new appError('sorry u can make only one review for this product',400))
            }
            const product=await Product.findById(req.params.ProdId);
            if(!product){
                return next(new appError('sorry this product is not exist!',400))
            }
            if(req.body.rating<1){
                return next(new appError('the minimum value for the rating is 1',400))
            }
            if(req.body.rating > 5){
                return next(new appError('the maximum value for the rating is 5',400))
            }
            const review=await Review.create(req.body);
            
            let stats=await ReviewCtrl.clacStatics(req.params.ProdId);
            product.rating=stats[0].avgRating;
            product.ratingQuantity=stats[0].ratingQuantity;
            await product.save();
            res.status(201).json({
                message:'the review is created..',
                review
            });
        }catch(err){
            console.log(err)
            next(new appError('somthing went wrong!',500));
        }
    },
    updateReview:async(req,res,next)=>{
        try{
            const review = await Review.findById(req.params.id);
            if(!review || review.active==false){
                return next(new appError('the review is not exist!',404));
            }
            if(review.userId.toString()!==req.user._id.toString()){
                return next(new appError('Sorry your cant update a review that not yours!',404));
            }
            if(req.body.rating){
                if(req.body.rating<1){
                    return next(new appError('the minimum value for the rating is 1',400))
                }
                if(req.body.rating > 5){
                    return next(new appError('the maximum value for the rating is 5',400))
                }
            }
            
        const updatedReview= await Review.findByIdAndUpdate(req.params.id,
            req.body,
            {new:true});

            const product=await Product.findById(review.productId);
            let stats=await ReviewCtrl.clacStatics(review.productId);
            product.rating=stats[0].avgRating;
            product.ratingQuantity=stats[0].ratingQuantity;
            await product.save();

            res.status(200).json({
                message:'the Review is updated..',
                updatedReview
            });
        }catch(err){
            console.log(err)
            next(new appError('somthing went wrong!',500));
        }
    },
    getReview:async(req,res,next)=>{
        try{
        const review_Id=req.params.id;
        const review=await Review.findById(review_Id).populate("userId","name -_id")
        if(!review || review.active==false){
            return next(new appError('this review is not exist!',404));
        }
        res.status(200).json({
            review
        })
    }catch(err){
        console.log(err);
        next(new appError('somthing went wrong!',500));
    }
    },
    getReviews:async(req,res,next)=>{
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
                {title:{$regex : req.query.search,$options:'i'}},
                {rating:{$regex:req.query.search,$options:'i'}}
            ]
        }
        
        if(req.params.ProdId){
            const productId=req.params.ProdId;
            const oldReviews=await Review.find({productId,active:true});
            if(oldReviews.length==0){
                return res.status(200).json({
                    message:" this product has no reviews yet"
                });
            }
            query.productId=productId;
        }
        query.active=true;
            const reviews=await Review.find(query)
            .select(fields)
            .sort(sortBy)
            .skip(skip)
            .limit(limit).populate("userId","name -_id")

            const total=await Review.countDocuments(query);
            const hasprv= page>0 && page!==1;
            const hasNext= page*limit + reviews.length <total;   
            res.status(200).json({
                reviews,
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
    
    deleteReview:async(req,res,next)=>{
        try{
            const review = await Review.findById(req.params.id);
            if(!review || review.active==false){
                return next(new appError('the review is not exist!',404));
            }
            if(review.userId.toString()!==req.user._id.toString()){
                return next(new appError('Sorry your cant update a review that not yours!',404));
            }
            review.active=false;
            await review.save();
            
            const product=await Product.findById(review.productId);
            let stats=await ReviewCtrl.clacStatics(review.productId);
            product.rating=stats[0].avgRating;
            product.ratingQuantity=stats[0].ratingQuantity;
            await product.save();
            
        
            res.status(204).json({
                message:"done"});
        }
        catch(error){
            console.log(error);
            next(new appError('somthing went wrong!',500));
        }
    },
}
module.exports=ReviewCtrl;