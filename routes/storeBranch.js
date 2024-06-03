const express=require('express');
const router=express.Router();
const BranchCtrl=require('../controllers/branch');
const middleware=require('../middleware/auth');
router.post('/createBranch',middleware.protect,middleware.restrictedTo(1),BranchCtrl.createBranch);
router.delete('/deleteBranch/:id',middleware.protect,middleware.restrictedTo(1),BranchCtrl.deleteBranch);
router.patch('/updateBranch/:id',middleware.protect,middleware.restrictedTo(1),BranchCtrl.updateBranch);
router.get('/getBranch/:id',middleware.protect,BranchCtrl.getBranch)
router.get('/getBranches',middleware.protect,BranchCtrl.getBranches)

module.exports=router;