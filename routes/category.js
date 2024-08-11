const express=require('express');
const validators=require('../utils/validators/categoryValidators');
const router=express.Router();
const categoryCtrl=require('../controllers/category');
const authCtrl=require('../middleware/auth');
const subCategoryRoute=require('../routes/subCategory');

const uploadMiddleware=require('../middleware/uploadMiddleware');
const resizeingMiddleware=require('../middleware/resizeingMiddleware');

router.post('/createCategory',authCtrl.protect,authCtrl.restrictedTo(1),uploadMiddleware.upload.single('category_image'),resizeingMiddleware.resizeingImage("categories",200,200),validators.createCategoryVlidator,categoryCtrl.createCategory);
router.patch('/updateCategory/:id',authCtrl.protect,authCtrl.restrictedTo(1),uploadMiddleware.upload.single('category_image'),resizeingMiddleware.resizeingImage("categories",200,200),validators.getCategoryVlidator,categoryCtrl.updateCategory)
router.get('/getCategory/:id',validators.getCategoryVlidator,categoryCtrl.getCategory);
router.get('/getCategories',categoryCtrl.getCategories);
router.delete('/deleteCtegory',authCtrl.protect,authCtrl.restrictedTo(1),categoryCtrl.deleteCtegory);

router.use('/:categoryId/getSubCategories',subCategoryRoute);
router.use('/:categoryId/createSubCategory',subCategoryRoute);
module.exports=router;