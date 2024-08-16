const Cart=require('../models/cartModel');
const Product=require('../models/productModel');
const Coupon=require('../models/couponModel');

const appError = require('../utils/appError');
const CartCtrl={
    addToCart:async(req,res,next)=>{
        try {
        //preparing the item
        const {product,quantity,color}=req.body;
        const theproduct=await Product.findById(product);
        if(!theproduct)
            return next(new appError('sorry this product is not exist right now!',404))
        if(quantity>theproduct.quantity){
            return next(new appError('sorry the quantity Exceeds the available quantity',400));
        }
        req.body.price=theproduct.price;

        //if not Cart for the loged user create one 
        const cart=await Cart.findOne({user:req.user._id}).select("-totalPriceAfterDiscount");
        if(!cart){
            const newCart=await Cart.create({cart_items:req.body,totalPrice:req.body.price*quantity,user:req.user._id});
            return res.status(200).json({
                message:'the item is added to the cart',
                newCart,
                totalNumOfProducts:newCart.cart_items.length
            });
        }
       
        //if there was a cart check if the item is in the cart
        let flag=0  //0=>p not exist =>push it 
                    // 1 =>the item is eixst and icrease the quantity
                   // 2=>the item is not exist with this color create one
        cart.cart_items.map(async(el)=>{
            if(el.product==product ){
                flag=1;
                if(el.color==color){
                flag=2;
                cart.totalPrice+=req.body.price*quantity
                el.quantity+=quantity;
                await cart.save();
                }
            }
        });
        if(flag==0 || flag==1){
            cart.cart_items.push(req.body);
            cart.totalPrice+=req.body.price*quantity;
            await cart.save();
        }
        res.status(200).json({
            message:'the item is added to the cart',
            cart,
            totalNumOfProducts:cart.cart_items.length
        });
        } catch (error) {
            console.log(error);
            next(new appError('something went wrong!',500));
        }
        
    },
    
    UpdateCartItem:async(req,res,next)=>{
        try{
            const itemId=req.params.id;
        const quantity=req.body.quantity;
        const userCart=await Cart.findOne({"cart_items._id":itemId})
        
        if(!userCart){
            return next(new appError('sorry this item is not exist in the cart!',404));
        }

        const theproduct=await Product.findById(userCart.cart_items.product);
        if(quantity>theproduct.quantity){
            return next(new appError('sorry the quantity Exceeds the available quantity',400));
        }
        let flag=0;
        userCart.cart_items.map((el,index)=>{
            if(el._id==itemId)
                flag=index;
        });
        userCart.cart_items[flag].quantity=quantity;
        console.log(userCart);
        await userCart.save();
        let totalPrice=0;
        userCart.cart_items.map(el=>{
                totalPrice+=el.price * el.quantity
            });
            userCart.totalPrice=totalPrice;
            userCart.totalPriceAfterDiscount=undefined;
            await userCart.save();
        res.status(200).json({
            message:'the item is updated',
            userCart
        });
        }catch(error){
            console.log(error);
            next(new appError('something went wrong!',500));
        }
    },
    getAllCartItems:async(req,res,next)=>{
        try{
        const cart=await Cart.findOne({user:req.user._id})
            .select("cart_items totalPrice")
            if(!cart){
                res.status(200).json({
                    message:"the cart is empty"
                });
            }
            res.status(200).json({
                cart
            });
        }catch(error){
            console.log(error)
            next(new appError('something went wrong!',500))
        }
    },
    removeCartItem:async(req,res,next)=>{
        try{
            const itemId=req.params.id;
            const cart=await Cart.findOneAndUpdate({user:req.user._id},{
                $pull:{cart_items:{_id:itemId}}
            },{new:true})
            
            let totalPrice=0;
            cart.cart_items.map(el=>{
                totalPrice+=el.price * el.quantity
            });
            cart.totalPrice=totalPrice;
            await cart.save();
            res.status(200).json({
                message:'the item is deleted..',
                cart
            });
        }catch(error){
            console.log(error)
            next(new appError('something went wrong!',500))
        }
        
    },
    emptyTheCart:async(req,res,next)=>{
        try {
            const cart=await Cart.findOne({user:req.user._id});
            if(!cart){
                return res.status(200).json({
                    message:'your cart is empty!'
                });
            }
            cart.cart_items=[];
            cart.totalPrice=0;
            cart.totalPriceAfterDiscount=0;
            await cart.save();
            return res.status(200).json({
                message:'your cart is empty now'
            });
        } catch (error) {
            console.log(error);
            return next(new appError('something went wrong!',500));
        }
    },
    applyCoupon:async(req,res,next)=>{
        try {
            const couponName=req.body.coupon;
            const coupon=await Coupon.findOne({name:couponName});
            if(!coupon){
                return next(new appError("this coupon is not exist or has been already expired",404));
            }
            const cart=await Cart.findOne({user:req.user._id});
            if(!cart){
                return res.status(200).json({
                    message:'your cart is empty!'
                });
            }
            
            cart.totalPriceAfterDiscount=cart.totalPrice- ((cart.totalPrice*coupon.discount)/100);
            await cart.save();
            return res.status(200).json({
                message:'the coupon is applied',
                cart
            });
        } catch (error) {
            console.log(error);
            return next(new appError('something went wrong!',500));
        }
    }
}
module.exports=CartCtrl;