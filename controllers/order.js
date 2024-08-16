const stripe=require('stripe')(process.env.STRIPE_SECRET_KEY)
const Order=require('../models/orderModel');
const Cart=require('../models/cartModel');
const Product=require('../models/productModel');
const appError=require('../utils/appError');
const dotenv=require('dotenv');
dotenv.config()
const orderCtrl={
    createOrder:async(req,res,next)=>{
        try{
            let taxPrice=0;
            let shippingPrice=0;
            let user=req.user._id;
            let shippingAddress=req.body;
        //1)get cart and 
        const cart=await Cart.findOne({user});
        if(!cart){
            return next (new appError('your cart is empty!',400));
        }
        let cartItems=cart.cart_items;
        let totalOrderPrice=0;
        if(cart.totalPriceAfterDiscount){
            totalOrderPrice=cart.totalPriceAfterDiscount + taxPrice +shippingPrice;
        }
        totalOrderPrice=cart.totalPrice + taxPrice +shippingPrice;
        //3)create the order with the default method cash
            const order=await Order.create({user,cartItems,shippingAddress,totalOrderPrice})
        //4)decrease product quantity and increase sold 
       
        for(let i=0;i<cart.cart_items.length;i++){
            let el=cart.cart_items[i];
            console.log(i+")"+el)
            console.log("##############this is a comment############")
            const product=await Product.findById(el.product);
            product.quantity-=el.quantity;
            product.sold+=el.quantity;
            console.log(product);
            await product.save();
        }
        //5)clear cart of the user
        cart.cart_items=[];
        cart.totalPrice=0;
        cart.totalPriceAfterDiscount=0;
        await cart.save();
        res.status(201).json({
            message:'the order is created...',
            order
        })
        }catch(error){
            console.log(error);
            next (new appError('somthing went wrong!',500));
        }
    },
    cancellOrder:async(req,res,next)=>{
        try {
            //check the orderid
            const orderId=req.params.id;
            const order=await Order.findById(orderId);
            if(!order){
                return next(new appError('Sorry this order is not exist!',404));
            }
            if(req.user._id.toString() !== order.user.toString()){
                return next(new appError('Sorry this order is not yours!',401));            
            }
            order.status='Cancelled';
            await order.save();
            res.status(200).json({
                message:'the order is Cancelled'
            })
        } catch (error) {
            console.log(error);
            next(new appError('Something went wrong!',500));
        }
    },
    updateOrderStatus:async(req,res,next)=>{
        try {
            const status=req.body.status;
            const orderId=req.params.id;
            const order=await Order.findById(orderId);
            if(!order || order.status=='Cancelled'){
                return next(new appError('Sorry this order is not exist!',404));
            }
            order.status=status;
            if(order.status=='Delivered'){
                order.isDelivered=true;
                order.deliveredAt=Date.now();
            }

            await order.save();
            res.status(200).json({
                message:'the order is updated',
                order
            })
        } catch (error) {
            console.log(error);
            next(new appError('Something went wrong!',500));
        }
    },
    getAllOrders:async(req,res,next)=>{
        try {
            const orders=await Order.find({status:{$ne:'Cancelled'}});
            res.status(200).json({
                orders,
                the_number_of_orders:orders.length
            });
        } catch (error) {
            console.log(error);
            next(new appError('Something went wrong!',500));
        }
    },
    getMyallOrders:async(req,res,next)=>{
        try {
            const orders=await Order.find({user:req.user._id});
            res.status(200).json({
                orders,
                the_number_of_orders:orders.length
            });
        } catch (error) {
            console.log(error);
            next(new appError('Something went wrong!',500));
        }
    },
    getAnOrder:async(req,res,next)=>{
        try {
            const orderId=req.params.id;
            const order=await Order.findById(orderId)
            .populate("user","name email phone")
            .populate("cartItems.product" ,"name description price onSale colors");
            if(!order || order.status=='Cancelled'){
                return next(new appError('Sorry this order is not exist!',404));
            }
            res.status(200).json({
                order,
            });
        } catch (error) {
            console.log(error);
            next(new appError('Something went wrong!',500));
        }
    },
    updateToPaid:async(req,res,next)=>{
        try {
            //check the orderid
            const orderId=req.params.id;
            const order=await Order.findById(orderId);
            if(!order || order.status=='Cancelled'){
                return next(new appError('Sorry this order is not exist!',404));
            }
            order.isPaid=true;
            order.paidAt=Date.now();
            await order.save();
            res.status(200).json({
                message:'the order is update to paid'
            })
        } catch (error) {
            console.log(error);
            next(new appError('Something went wrong!',500));
        }
    },
    checkOut:async(req,res,next)=>{
        
        const cart=await Cart.findById(req.params.id);
        if(!cart){
            return next (new appError('this cart is not exists',400));
        }
        let totalOrderPrice=0;
        if(cart.totalPriceAfterDiscount){
            totalOrderPrice=cart.totalPriceAfterDiscount + taxPrice +shippingPrice;
        }
        totalOrderPrice=cart.totalPrice;
        const session= await stripe.checkout.sessions.create({
            line_items:[
                {
                    price_data: {
                        currency: 'egp',
                        product_data: {
                            name: req.user.name,
                        },
                        unit_amount: totalOrderPrice * 100, 
                    },
                    
                    quantity:1,
                },
            ],
            mode:'payment',
            success_url:`${req.protocol}://${req.get('host')}/`,
            cancel_url:`${req.protocol}://${req.get('host')}/api/product/getAllProducts`,
            customer_email:req.user.email,
            client_refernce_id:cart._id,
            payment_method_types:['card'],
        })
        res.status(200).json({
            status:'success',
            session
        })
    }
}

module.exports=orderCtrl;
