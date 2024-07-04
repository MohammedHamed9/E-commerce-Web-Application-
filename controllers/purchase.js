const stripe=require('stripe')(process.env.STRIPE_SECRET_KEY)
const dotenv=require('dotenv');
const Product=require('../models/productModel');
const appError=require('../utils/appError');
const { CurrencyCodes } = require('validator/lib/isISO4217');
dotenv.config()
purchaseCtrl={
    getCheckoutSession:async(req,res,next)=>{
        //check on productId
        const product=await Product.findById(req.params.prodId);
        if(!product)
        next(new appError('sorry this product is not exist!',400))
        //create the session 
        const session =stripe.checkout.sessions.create({
            payment_method_types:['card'],
            success_url:`${req.protocol}://${req.get('host')}/`,
            cancel_url:`${req.protocol}://${req.get('host')}/api/product/getAllProducts`,
            customer_email:req.user.email,
            client_refernce_id:product._id,
            line_items:[
                {
                    name:product.name_ar,
                    quantity:1,
                    amount:product.price,
                    currency:'usd'
                }
            ]
        })
        //console.log(`req.protocol:${req.protocol} + req.get('host'): ${req.get('host')}`)
        //send the session 
        res.status(200).json({
            status:'success',
            session
        })
    }
}   
module.exports=purchaseCtrl;
