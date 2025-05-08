const express=require("express");
const router=express.Router();
const controllerUser=require("../controller/user");

router.get("/",controllerUser.userHome)
router.get("/anc/view/:slug",controllerUser.viewAnc) //ejs sayfasından veritabanına kayıtlı slug parametre olarak gelir.

module.exports=router;