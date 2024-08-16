const express=require('express');
const router=express.Router();

const authCtrl=require('../middleware/auth');
const orderCtrl=require('../controllers/order');

router.post('/createOrder',authCtrl.protect,authCtrl.restrictedTo(0),orderCtrl.createOrder);
router.patch('/cancellOrder/:id',authCtrl.protect,authCtrl.restrictedTo(0),orderCtrl.cancellOrder);
router.patch('/updateOrderStatus/:id',authCtrl.protect,authCtrl.restrictedTo(0),orderCtrl.updateOrderStatus);
router.patch('/updateToPaid/:id',authCtrl.protect,authCtrl.restrictedTo(0),orderCtrl.updateToPaid);
router.get('/getAllOrders',authCtrl.protect,authCtrl.restrictedTo(1),orderCtrl.getAllOrders);
router.get('/getMyallOrders',authCtrl.protect,authCtrl.restrictedTo(0),orderCtrl.getMyallOrders);
router.get('/getAnOrder/:id',authCtrl.protect,authCtrl.restrictedTo(0),orderCtrl.getAnOrder);
router.get('/checkOut/:id',authCtrl.protect,authCtrl.restrictedTo(0),orderCtrl.checkOut);

module.exports=router;
