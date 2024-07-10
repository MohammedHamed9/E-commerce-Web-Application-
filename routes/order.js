const express=require('express');
const router=express.Router();

const authCtrl=require('../middleware/auth');
const orderCtrl=require('../controllers/order');

router.get('/createOrder',authCtrl.protect,authCtrl.restrictedTo(0),orderCtrl.createOrder);
router.patch('/cancellOrder/:id',authCtrl.protect,authCtrl.restrictedTo(0),orderCtrl.cancellOrder);
router.patch('/updateOrderStatus/:id',authCtrl.protect,authCtrl.restrictedTo(1),orderCtrl.updateOrderStatus);
router.get('/getAllOrders',authCtrl.protect,authCtrl.restrictedTo(1),orderCtrl.getAllOrders);
router.get('/getMyallOrders',authCtrl.protect,authCtrl.restrictedTo(0),orderCtrl.getMyallOrders);
router.get('/getAnOrder/:id',authCtrl.protect,orderCtrl.getAnOrder);

module.exports=router;
