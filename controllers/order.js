const Order=require('../models/orderModel');
const Product=require('../models/productModel');
const appError=require('../utils/appError');

const orderCtrl={
    createOrder:async(req,res,next)=>{
        try{
            //get all cart items and add them to the order
            let products=req.user.cart.products;
            const customer_id=req.user._id
            if(products.length==0){
                return next(new appError('sorry the cart is empty!',400))
            }
            //clac the total amount and decrease the products with the quantity that has been ordered
            let totalAmount=0;
            for(let i=0;i<products.length;i++){
                const product= await Product.findById(products[i].product);
                totalAmount+=product.price;
                await Product.findByIdAndUpdate(products[i].product,{
                    quantity:product.quantity-products[i].quantity
                    })
            }            
            //clear cart items 
            req.user.cart.products=[];
            await req.user.save();
            //create order
            const order=await Order.create({products,customer_id,totalAmount})
            res.status(201).json({
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
            if(req.user._id.toString() !== order.customer_id.toString()){
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
            if(!order){
                return next(new appError('Sorry this order is not exist!',404));
            }
            order.status=status;
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
            const orders=await Order.find();
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
            const orders=await Order.find({customer_id:req.user._id});
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
            const order=await Order.findById(orderId).populate('products.product','-__v -admin_created_id -quantity');
            if(!order){
                return next(new appError('Sorry this order is not exist!',404));
            }
            res.status(200).json({
                order,
            });
        } catch (error) {
            console.log(error);
            next(new appError('Something went wrong!',500));
        }
    }
}

module.exports=orderCtrl;
