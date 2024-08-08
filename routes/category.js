const express=require('express');
const validators=require('../utils/validators/categoryValidators');
const router=express.Router();
const categoryCtrl=require('../controllers/category');
const uploadMiddleware=require('../middleware/uploadCategory');
const authCtrl=require('../middleware/auth');
const subCategoryRoute=require('../routes/subCategory');

router.post('/createCategory',authCtrl.protect,authCtrl.restrictedTo(1),uploadMiddleware.upload.single('category_image'),validators.createCategoryVlidator,categoryCtrl.createCategory);
router.patch('/updateCategory/:id',authCtrl.protect,authCtrl.restrictedTo(1),validators.getCategoryVlidator,uploadMiddleware.upload.single('category_image'),categoryCtrl.updateCategory)
router.get('/getCategory/:id',validators.getCategoryVlidator,categoryCtrl.getCategory);
router.get('/getCategories',categoryCtrl.getCategories);
router.delete('/deleteCtegory',authCtrl.protect,authCtrl.restrictedTo(1),categoryCtrl.deleteCtegory);

router.use('/:categoryId/getSubCategories',subCategoryRoute);
router.use('/:categoryId/createSubCategory',subCategoryRoute);
module.exports=router;