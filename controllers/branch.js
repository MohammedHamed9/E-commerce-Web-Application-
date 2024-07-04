const { parse } = require('dotenv');
const Branch=require('../models/storeBranchModel');
const Store=require('../models/storeModel');
const appError = require('../utils/appError');

const BranchCtrl=
{
    createBranch:async(req,res,next)=>{
        try{
            const {store_id,address_ar,address_en,working_hours_from,
                    working_hours_to,status,phone,categories,products}
            =req.body

            if(!store_id){
                return next(new appError('please add the soreId'));
            }

            const store=await Store.findById(store_id);
            
            if(!store||store.status==false)
            return res.status(500).json({
                message:'this store is not available!'
            });
            
            const branch=await Branch.create({
                store_id,
                address_ar,
                address_en,
                working_hours_from,
                working_hours_to,
                status,
                phone,
                categories,
                products,
                admin_created_id:req.user._id
            });
            
            store.branches.push(branch._id);
            await store.save();

            res.status(201).json({
                    message:'the branch is created..',
                    branch
                })
        }
        catch(err){
            console.log(err)
            next(new appError('somthing went wrong!',500));
        }
    },
    updateBranch:async(req,res,next)=>{
        try{
        const branch=await Branch.findById(req.params.id);
        if(!branch)
        return next(new appError('this branch is not found!',404));

        admin_update_id=req.user._id;
        
        if(req.body.categories){
            const array =req.body.categories.map(el=>{
                if(branch.categories.includes(el)){
                    return res.status(400).json({
                        message:'sorry but this category is exist before !'
                    })
                }
                return branch.categories.push(el)
            });
            await branch.save();
            req.body.categories=branch.categories;
        }
        if(req.body.products){
            const array =req.body.products.map(el=>{
                if(branch.products.includes(el)){
                    return res.status(400).json({
                        message:'sorry but these products is exist before !'
                    })
                }
                return branch.products.push(el)
            })
            await branch.save();
            req.body.products=branch.products;
        }
        const newBranch=await Branch.findByIdAndUpdate(req.params.id,
            req.body
            ,{new:true});
        res.status(200).json({
            message:'the branch is updated..',
            newBranch
        })
    }catch(err){
        console.log(err)
        next(new appError('somthing went wrong!',500))
    }
},
    deleteBranch:async(req,res,next)=>{
        try{
        const branch_id=req.params.id;
        const branch=await Branch.findById(branch_id);
        if(!branch){
            return next(new appError('this branch is not found!',400));
        }
        store_id=branch.store_id;
        const store=await Store.findById(store_id);
        //console.log(branch ,store);
        
        //to delete the branch_id from the branches array too 

        store.branches=store.branches.filter(el=>el!=branch_id);
        await store.save();
        await branch.deleteOne();
        res.status(203).json({
            message:'the branch is deleted..'
        })
    }catch(err){
        console.log(err)
        next(new appError('somthing went wrong!',500))
    }
},
    getBranch:async(req,res,next)=>{
        try{const branch_id=req.params.id;

            if(!branch_id){
            return next(new appError('please enter the branch id!',400));
        }
        const branch=await Branch.findById(branch_id,{store_id:1,address_ar:1,address_en:1,working_hours_from:1,
            working_hours_to:1,status:1,phone:1,
            categories:1,products:1})
        .populate("store_id","name_ar name_en description_ar description_en")
        .populate("categories","name_ar name_en category_imge")
        .populate("products.product","name_ar name_en product_imge")
        if(!branch){
            return next(new appError('this branch is not exist!',404));
        }
        res.status(200).json({
            branch
        });
    }catch(err){
        console.log(err)
        next(new appError('somthing went wrong!',500));
    }
    },
    getBranches:async(req,res,next)=>{
        try{
            const page=parseInt(req.query.page,10)||1;
            const limit=parseInt(req.query.limit,10)||10;
            const search=req.query.search||"";
            const product_id=req.query.product_id||"";
            const category_id=req.query.category_id||"";
            const store_id=req.query.category_id||"";
            let query={
                status:true
            }
            if(product_id){
            query={
                'products.product':product_id,
                status:true
            }
        }
        if(category_id){
            query={
                'categories':category_id,
                status:true
            }
        }
        if(store_id){
            query.store_id={
                'store_id':store_id,
                status:true
            }
        }
            //console.log(query);
            const branchs= await Branch.find(query,
                {store_id:1,address_ar:1,address_en:1,working_hours_from:1,
                    working_hours_to:1,status:1,phone:1,
                    categories:1,products:1})
            .populate("store_id","name_ar name_en description_ar description_en")
            .populate("categories","name_ar name_en category_imge")
            .populate("products.product","name_ar name_en product_imge")
            .sort({_id:1})
            .skip((page-1)*limit)
            .limit(limit);
            const total=await Branch.countDocuments(query);
            const hasprv=page>0&&page!=1;
            const hasNext=page*limit+branchs.length<total;
            res.status(200).json({
                branchs,
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
    }
}
module.exports=BranchCtrl;