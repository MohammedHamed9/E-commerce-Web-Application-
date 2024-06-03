const express=require('express');
const router=express.Router();
const purchaseCtrl=require('../controllers/purchase');
const middleware=require('../middleware/auth');

router.get('/getCheckoutSession/:prodId',middleware.protect,purchaseCtrl.getCheckoutSession)

module.exports=router;