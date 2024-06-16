const express=require("express");
const router=express.Router();
const userCtrl=require("../controllers/user");
const authCtrl=require('../middleware/auth');
const uploadMiddleware=require("../middleware/uploadAvatars");
const resizeingMiddleware=require('../middleware/resizeingAvatars');
router.post("/createUser",userCtrl.createUser);

router.post("/signUp",uploadMiddleware.upload.single('avatar'),resizeingMiddleware.resizeingAvatars,userCtrl.signUp);
router.post("/login",userCtrl.login);
router.get('/logout',userCtrl.logout);
router.delete("/deleteUser/:id",authCtrl.protect,authCtrl.restrictedTo(1),userCtrl.deleteUser);
router.get('/getVerificationCode',authCtrl.protect,userCtrl.getVerificationCode);
router.get('/verifyAcc',authCtrl.protect,userCtrl.verifyAcc);
router.post('/forgetPassword',userCtrl.forgetPassword);
router.post('/resetPassword/:token',userCtrl.resetPassword);
router.patch('/updateMe',authCtrl.protect,uploadMiddleware.upload.single('avatar'),resizeingMiddleware.resizeingAvatars,userCtrl.updateMe);
router.patch('/updatePassword',authCtrl.protect,userCtrl.updatePassword);
router.delete('/deleteMe',authCtrl.protect,userCtrl.deleteMe);
router.post('/addToCart',authCtrl.protect,userCtrl.addToCart);
router.get('/getCartItem/:productId',authCtrl.protect,userCtrl.getCartItem);
router.get('/getAllCartItems',authCtrl.protect,userCtrl.getAllCartItems);
router.patch('/UpdateCartItem/:productId',authCtrl.protect,userCtrl.UpdateCartItem);
router.delete('/removeCartItem/:productId',authCtrl.protect,userCtrl.removeCartItem);
router.get('/getAllFavoriteItems',authCtrl.protect,userCtrl.getAllFavoriteItems);
router.post('/addFavItem/:productId',authCtrl.protect,userCtrl.addFavItem);
router.delete('/removeFavItem/:productId',authCtrl.protect,userCtrl.removeFavItem);

module.exports=router;