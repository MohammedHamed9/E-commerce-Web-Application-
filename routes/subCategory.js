const express=require('express');
const router=express.Router({mergeParams:true});
const subCategoryCtrl=require('../controllers/subCategory');
const authCtrl=require('../middleware/auth');
const validators=require('../utils/validators/subCategoryValidator');
router.route('/')
.post(authCtrl.protect,authCtrl.restrictedTo(1),subCategoryCtrl.setCategoryIdToBody,validators.createsubCategory,subCategoryCtrl.createsubCategory)
.get(subCategoryCtrl.getSubCategories)
router.get('/getSubCategory/:id',validators.getSubCategory,subCategoryCtrl.getSubCategory)
router.patch('/updateSubCategory/:id',authCtrl.protect,authCtrl.restrictedTo(1),validators.getSubCategory,subCategoryCtrl.updateSubCategory)
router.delete('/deleteSubCategory/:id',authCtrl.protect,authCtrl.restrictedTo(1),validators.getSubCategory,subCategoryCtrl.deleteSubCategory)

module.exports=router;