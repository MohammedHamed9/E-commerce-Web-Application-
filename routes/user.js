const express=require("express");
const router=express.Router();
const userCtrl=require("../controllers/user");
const authCtrl=require('../middleware/auth');
const uploadMiddleware=require("../middleware/uploadMiddleware");
const resizeingMiddleware=require('../middleware/resizeingMiddleware');
const validators=require('../utils/validators/userValidators');

router.post("/createUser",authCtrl.protect,authCtrl.restrictedTo(1),validators.createUserVlidator,userCtrl.createUser);

router.post("/signUp",uploadMiddleware.upload.single('avatar'),resizeingMiddleware.resizeingImage("avatars",100,100),validators.createUserVlidator,userCtrl.signUp);
router.post("/login",userCtrl.login);
router.get('/logout',userCtrl.logout);
router.get("/getUser",authCtrl.protect,authCtrl.restrictedTo(1),userCtrl.getUser);
router.get("/getAllUsers",authCtrl.protect,authCtrl.restrictedTo(1),userCtrl.getAllUsers);
router.patch('/updateUser/:id',authCtrl.protect,authCtrl.restrictedTo(1)
,validators.getUserVlidator,userCtrl.updateUser);
router.delete("/deleteUser/:id",authCtrl.protect,authCtrl.restrictedTo(1),validators.getUserVlidator,userCtrl.deleteUser);
router.get('/getVerificationCode',authCtrl.protect,userCtrl.getVerificationCode);
router.get('/verifyAcc',authCtrl.protect,userCtrl.verifyAcc);
router.post('/forgetPassword',userCtrl.forgetPassword);
router.post('/resetPassword/:token',userCtrl.resetPassword);
router.patch('/updateMe',authCtrl.protect,uploadMiddleware.upload.single('avatar'),resizeingMiddleware.resizeingImage("avatars",100,100),userCtrl.updateMe);
router.patch('/updatePassword',authCtrl.protect,userCtrl.updatePassword);
router.delete('/deleteMe',authCtrl.protect,userCtrl.deleteMe);


router.get('/getAllFavoriteItems',authCtrl.protect,authCtrl.restrictedTo(0),userCtrl.getAllFavoriteItems);
router.post('/addFavItem/:productId',authCtrl.protect,authCtrl.restrictedTo(0),userCtrl.addFavItem);
router.delete('/removeFavItem/:productId',authCtrl.protect,authCtrl.restrictedTo(0),userCtrl.removeFavItem);

router.post('/addAddress',authCtrl.protect,authCtrl.restrictedTo(0),userCtrl.addAddress);
router.delete('/removeAddress/:id',authCtrl.protect,authCtrl.restrictedTo(0),userCtrl.removeAddress);
router.get('/getAllAdresses',authCtrl.protect,authCtrl.restrictedTo(0),userCtrl.getAllAdresses);
router.patch('/updateAddress/:id',authCtrl.protect,authCtrl.restrictedTo(0),userCtrl.updateAddress);

module.exports=router;