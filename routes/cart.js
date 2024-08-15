const express=require('express');
const router=express.Router();
const cartCtrl=require('../controllers/cart');
const authCtrl=require('../middleware/auth');

router.post('/addToCart',authCtrl.protect,authCtrl.restrictedTo(0),cartCtrl.addToCart);
router.get('/getAllCartItems',authCtrl.protect,authCtrl.restrictedTo(0),cartCtrl.getAllCartItems);
router.patch('/UpdateCartItem/:id',authCtrl.protect,authCtrl.restrictedTo(0),cartCtrl.UpdateCartItem);
router.delete('/removeCartItem/:id',authCtrl.protect,authCtrl.restrictedTo(0),cartCtrl.removeCartItem);
router.get('/emptyTheCart',authCtrl.protect,authCtrl.restrictedTo(0),cartCtrl.emptyTheCart);
router.post('/applyCoupon',authCtrl.protect,authCtrl.restrictedTo(0),cartCtrl.applyCoupon);

module.exports=router;
