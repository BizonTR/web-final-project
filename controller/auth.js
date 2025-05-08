//const authData=require("../data/authdata");
const Users=require("../models/users")
const session = require("express-session");
const bcrypt = require('bcrypt');
const userCategory = require("../models/usercategory");
//const db=require("../data/db");

exports.getLogin=(req,res,next)=>{
    const message=req.session.message;
    console.log("mesaj",message);
    delete req.session.message;//sadece message session silinir. destroy tümünü siler.
    res.render("auth/login",{title:"Login",contentTitle:"Login",message:message});
}


exports.postLogin = async (req, res, next) => {
    const user = await Users.findOne({
        where: { email: req.body.email },
        include: { model: userCategory, attributes: ["id", "categoryname"] },
        raw: true,
    });

    if (!user) {
        req.session.message = { text: "Email hatalı", class: "warning" };
        return res.redirect("login");
    }

    if (await bcrypt.compare(req.body.password, user.password)) {
        req.session.isAuth = true;
        req.session.userid = user.id;
        req.session.fullname = user.name + " " + user.surname;
        req.session.usercategoryId = user["usercategory.id"]; // Kullanıcı kategorisi ID'si oturuma ekleniyor

        return res.redirect("/");
    }

    req.session.message = { text: "Şifre hatalı", class: "warning" };
    return res.redirect("login");
};


    exports.signout=async(req,res)=>{
        await req.session.destroy(); //session temizle
        res.redirect("/auth/login"); //ana sayfaya git
    }
