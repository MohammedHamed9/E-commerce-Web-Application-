const Order=require('../models/orderModel');
const appError=require('../utils/appError');

const orderCtrl={
    createOrder:async(req,res,next)=>{
        try{

        }catch(error){
            console.log(error);
            next (new appError('somthing went wrong!',500));
        }
    }
}

module.exports=orderCtrl;
