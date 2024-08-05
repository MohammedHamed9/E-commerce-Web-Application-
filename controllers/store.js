const e = require("express");
const Store=require("../models/storeModel");
const Branch=require("../models/storeBranchModel")
const appError = require("../utils/appError");
const storeCtrl=
{
    createStore:async(req,res,next)=>{
        try{const{name_ar,
            name_en,
            description_ar,
            description_en,
            review,
            }=req.body
            admin_created_id=req.user._id;
        const store=await Store.create({name_ar,
            name_en,
            description_ar,
            description_en,
            review,
            admin_created_id});
            res.status(201).json({
                message:"the store is created",
                store
            })
        }catch(err){
            console.log(err);
            next(new appError('somthing went wrong!',500));
        }
},
    updateStore:async(req,res)=>{
        try{
            const store=await Store.findById(req.params.id);

            if(!store)
            return res.status(404).json({
                message:"this store is not found!"
            });

            const updatedStore=await Store.findByIdAndUpdate(req.params.id,req.body
                ,{new:true});
            
            res.status(200).json({
                message:"the store is updated",
                updatedStore
            });
    }catch(err){
        console.log(err);
        next(new appError('somthing went wrong!',500));
    }
},
    getAllStores:async(req,res)=>{
        try{
        const page=parseInt(req.query.page,10)||1
        const limit=parseInt(req.query.limit,10)||10
        const search=req.query.search||""
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
            }],
            status:true
        }

    const stores=await Store.find(query,
        {name_ar:1,name_en:1,description_ar:1,description_en:1,
            review:1,status:1})
    .skip((page-1)*limit)
    .limit(limit)
    .sort({_id:1});

    const total=await Store.countDocuments(query);

    const hasprv= page>0 && page!==1;
    const hasNext=page*limit+stores.length<total;
            res.status(200).json({
                stores,
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
    getStore:async(req,res,next)=>{
    try{
        const store=await Store.findById(req.params.id)
        .populate("admin_created_id","_id name email phone").select("-__v")
        
        if(!store){
            return next(new appError('this store is not found!',404));
        }
        
        res.status(200).json({
            store
        })
    }catch(err){
        console.log(err);
        next(new appError('somthing went wrong!',500));
    }
},
//NOT IMPLEMENTED YET
    deleteStore:async(req,res,next)=>{
        try{
            //chick if the stroe exist 
            const storeId=req.params.id;
            const store=await Store.findById(storeId);
            if(!store){
                return next(new appError('sorry this store is not exist!',404));
            }
            //chech if the store has branches
            let branchesIds=[];
            //delete all branches
            if(store.branches.length>0){
                store.branches.map(el=>{
                    branchesIds.push(el);
                });
            await Branch.deleteMany({_id:{$in:branchesIds}});
            }
            //delete the stroe
            await Store.findByIdAndDelete(storeId);
            res.status(204).json({
                message:'done'
            });
            
        }catch(error){
            console.log(error);
            next(new appError('somthing went wrong!',500));
        }
    }
}
module.exports=storeCtrl