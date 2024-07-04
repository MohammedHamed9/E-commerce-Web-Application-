const express=require('express');
const router=express.Router();
const categoryCtrl=require('../controllers/category');
const uploadMiddleware=require('../middleware/uploadCategory');
const authCtrl=require('../middleware/auth');
router.post('/createCategory',authCtrl.protect,authCtrl.restrictedTo(1),uploadMiddleware.upload.single('category_image'),categoryCtrl.createCategory);
router.patch('/updateCategory/:id',authCtrl.protect,authCtrl.restrictedTo(1),uploadMiddleware.upload.single('category_image'),categoryCtrl.updateCategory)
router.get('/getCategory/:id',categoryCtrl.getCategory);
router.get('/getCategories',categoryCtrl.getCategories);
router.delete('/deleteCtegory',authCtrl.protect,authCtrl.restrictedTo(1),categoryCtrl.deleteCtegory);
module.exports=router;
