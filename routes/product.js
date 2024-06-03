const express=require('express');
const router=express.Router();
const productCtrl=require('../controllers/product');
const authCtrl=require('../middleware/auth');
const uploadMiddleware=require('../middleware/uploadProduct');
router.post('/createProduct',authCtrl.protect,authCtrl.restrictedTo(1),uploadMiddleware.upload.single('product_image'),productCtrl.createProduct);
router.patch('/updateProduct/:id',authCtrl.protect,authCtrl.restrictedTo(1),uploadMiddleware.upload.single('product_image'),productCtrl.updateProduct);
router.get('/getAllProducts',authCtrl.protect,productCtrl.getAllProducts);
router.get('/getProduct/:id',authCtrl.protect,productCtrl.getProduct);
router.get('/searchForProduct',authCtrl.protect,productCtrl.searchForProduct);
router.get('/filterPorducts',productCtrl.filterPorducts);


module.exports=router;
