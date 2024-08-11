const express=require('express');
const validators=require('../utils/validators/BrandValidators');
const router=express.Router();
const BrandCtrl=require('../controllers/Brand');
const authCtrl=require('../middleware/auth');
const uploadMiddleware=require("../middleware/uploadMiddleware");
const resizeingMiddleware=require('../middleware/resizeingMiddleware');

router.route('/')
.post(authCtrl.protect,authCtrl.restrictedTo(1),uploadMiddleware.upload.single('Brand_image'),resizeingMiddleware.resizeingImage("Brands",200,200),validators.createBrandVlidator,BrandCtrl.createBrand)
.get(BrandCtrl.getBrands)
.delete(authCtrl.protect,authCtrl.restrictedTo(1),BrandCtrl.deleteBrand)

router.route('/:id')
.patch(authCtrl.protect,authCtrl.restrictedTo(1),uploadMiddleware.upload.single('Brand_image'),resizeingMiddleware.resizeingImage("Brands",200,200),validators.getBrandVlidator,BrandCtrl.updateBrand)
.get(validators.getBrandVlidator,BrandCtrl.getBrand);

module.exports=router;