const express=require("express");
const router=express.Router();
const authController=require("../controller/auth");

router.get("/login",authController.getLogin);
router.post("/login",authController.postLogin);

router.get("/signout",authController.signout);

module.exports=router;