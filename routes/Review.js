const express=require('express');
const router=express.Router();
const ReviewCtrl=require('../controllers/Review');
const authCtrl=require('../middleware/auth');
const validators=require('../utils/validators/ReviewValidators');
router.post('/createReview/:ProdId',authCtrl.protect,authCtrl.restrictedTo(0),validators.createReviewVlidator,ReviewCtrl.createReview)
router.patch('/updateReview/:id',authCtrl.protect,authCtrl.restrictedTo(0),ReviewCtrl.updateReview)
router.get('/getReview/:id',ReviewCtrl.getReview);
router.get('/',ReviewCtrl.getReviews);
router.get('/getstats/:id',ReviewCtrl.clacStatics);
router.get('/:ProdId',ReviewCtrl.getReviews);
router.delete('/deleteReview/:id',authCtrl.protect,ReviewCtrl.deleteReview)
module.exports=router;