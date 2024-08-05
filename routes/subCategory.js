const express=require('express');
const router=express.Router()
const subCategoryCtrl=require('../controllers/subCategory');
const authCtrl=require('../middleware/auth');
const validators=require('../utils/validators/subCategoryValidator');
router.post('/createsubCategory',authCtrl.protect,authCtrl.restrictedTo(1),validators.createsubCategory,subCategoryCtrl.createsubCategory)

module.exports=router;