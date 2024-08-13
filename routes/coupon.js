const express=require('express');
const router=express.Router();
const CouponCtrl=require('../controllers/coupon');
const authCtrl=require('../middleware/auth');


router.post('/createCoupon',authCtrl.protect,authCtrl.restrictedTo(1),CouponCtrl.createCoupon);
router.patch('/updateCoupon/:id',authCtrl.protect,authCtrl.restrictedTo(1),CouponCtrl.updateCoupon);
router.get('/getCoupon/:id',authCtrl.protect,CouponCtrl.getCoupon);
router.get('/getCoupons',authCtrl.protect,CouponCtrl.getCoupons);

module.exports=router;