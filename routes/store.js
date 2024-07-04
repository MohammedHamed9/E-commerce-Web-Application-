const router=require("express").Router();
const storeCtrl=require("../controllers/store");
const auth=require("../middleware/auth");
router.post("/createStore",auth.protect,auth.restrictedTo(1),storeCtrl.createStore); 
router.patch("/updateStore/:id",auth.protect,auth.restrictedTo(1),storeCtrl.updateStore);
router.get("/getAllStores",auth.protect,storeCtrl.getAllStores);
router.get("/getStore/:id",auth.protect,storeCtrl.getStore);
router.delete("/deleteStore/:id",auth.protect,auth.restrictedTo(1),storeCtrl.deleteStore)
module.exports=router;