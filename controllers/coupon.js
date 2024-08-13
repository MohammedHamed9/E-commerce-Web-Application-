
const Coupon=require('../models/couponModel');
const appError = require('../utils/appError');

const CouponCtrl={
    createCoupon:async(req,res,next)=>{
        try{
            req.body.admin_created_id=req.user._id;
            const coupon=await Coupon.create(req.body);
            res.status(201).json({
                message:'the Coupon is created..',
                coupon
            });
        }catch(err){
            console.log(err)
            next(new appError('somthing went wrong!',500));
        }
    },
    updateCoupon:async(req,res,next)=>{
        try{
            const coupon = await Coupon.findById(req.params.id);
            if(!coupon){
                return next(new appError('the Coupon is not exist!',404));
            }
            req.body.admin_update_id=req.user._id;

        const updatedCoupon= await Coupon.findByIdAndUpdate(req.params.id,
            req.body,
            {new:true});
            res.status(200).json({
                message:'the Coupon is updated..',
                updatedCoupon
            });
        }catch(err){
            console.log(err)
            next(new appError('somthing went wrong!',500));
        }
    },
    getCoupon:async(req,res,next)=>{
        try{
        const coupon_id=req.params.id;
        const coupon=await Coupon.findById(coupon_id)
        if(!coupon || coupon.active==false){
            return next(new appError('this Coupon is not exist!',404));
        }
        res.status(200).json({
            coupon
        })
    }catch(err){
        console.log(err);
        next(new appError('somthing went wrong!',500));
    }
    },
    getCoupons:async(req,res,next)=>{
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
                    {discount:{$regex:req.query.search,$options:'i'}}
                ]
            }
                query.active=true
                const coupons=await Coupon.find(query)
                .select(fields)
                .sort(sortBy)
                .skip(skip)
                .limit(limit)
    
                const total=await Coupon.countDocuments();
                const hasprv= page>0 && page!==1;
                const hasNext= page*limit + coupons.length <total;   
                res.status(200).json({
                    coupons,
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
    
    deleteCoupon:async(req,res,next)=>{
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
module.exports=CouponCtrl;