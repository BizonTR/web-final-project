const express=require("express");
const adminController=require("../controller/admin");
const isAuth=require("../middleware/isAuth");

router=express.Router();

router.get("/",isAuth,adminController.homePage);

router.get("/add/anc",adminController.get_addAnc); //isAuth tüm router isteklere eklenebilir.

router.post("/add/anc",adminController.post_addAnc);

router.get("/list/anc",isAuth,adminController.listAnc);

router.get("/edit/anc/:id",adminController.get_editAnc);

router.post("/edit/anc/:id",adminController.post_editAnc);

router.get("/delete/anc/:id",adminController.get_deleteAnc);

router.post("/delete/anc",adminController.post_deleteAnc);

router.get("/add/user",adminController.get_addUser);

router.post("/add/user",adminController.post_addUser);

router.get("/list/users",adminController.listUser);

router.get("/edit/user/:id",(req,res)=>{res.send("Siz yazın")});

router.get("/delete/user/:id",(req,res)=>{res.send("Siz yazın")});

router.post("/delete/user",(req,res)=>{res.send("Siz yazın")});

router.get("/ckeditor",adminController.ckeditor)

module.exports=router;