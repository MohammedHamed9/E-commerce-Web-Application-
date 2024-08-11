const express=require('express');
const router=express.Router();
const productCtrl=require('../controllers/product');
const authCtrl=require('../middleware/auth');
const uploadMiddleware=require('../middleware/uploadMiddleware');
const resizeingMiddleware=require('../middleware/resizeingMiddleware');
const validators=require("../utils/validators/productValidations")
router.post('/createProduct',authCtrl.protect,authCtrl.restrictedTo(1),
uploadMiddleware.upload
.fields([{ name: 'image_cover', maxCount: 1 }, { name: 'product_images', maxCount: 5 }])
,resizeingMiddleware.resizeingImage("products",200,200),
validators.createProductVlidator,productCtrl.createProduct);

router.patch('/updateProduct/:id',authCtrl.protect,authCtrl.restrictedTo(1),validators.getProductVlidator,productCtrl.updateProduct);
router.get('/getAllProducts',productCtrl.getAllProducts);
router.get('/getProduct/:id',validators.getProductVlidator,productCtrl.getProduct);
router.get('/searchForProduct',authCtrl.protect,productCtrl.searchForProduct);
router.get('/filterPorducts',authCtrl.protect,productCtrl.filterPorducts);
router.delete('/deleteProduct/:id',authCtrl.protect,authCtrl.restrictedTo(1),validators.getProductVlidator,productCtrl.deleteProduct);

module.exports=router;
