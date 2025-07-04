//const authData=require("../data/authdata");
const Users=require("../models/users")
const session = require("express-session");
const bcrypt = require('bcrypt');
const userCategory = require("../models/usercategory");
//const db=require("../data/db");

exports.getLogin=(req,res,next)=>{
    if (req.session.isAuth) {
        // Kullanıcı oturum açmışsa, profil sayfasına yönlendir
        return res.redirect(`/user/profile/${req.session.userid}`);
    }
    const message=req.session.message;
    console.log("mesaj",message);
    delete req.session.message;//sadece message session silinir. destroy tümünü siler.
    res.render("auth/login",{title:"Login",contentTitle:"Login",message:message});
}


exports.postLogin = async (req, res, next) => {
    try {
        const user = await Users.findOne({ 
            where: { email: req.body.email },
            include: [{ model: userCategory, attributes: ['id'] }] // Kullanıcı kategorisini dahil et
        });

        if (!user) {
            req.session.message = { text: "Kullanıcı bulunamadı.", class: "danger" };
            return res.redirect("/auth/login");
        }

        const isPasswordValid = await bcrypt.compare(req.body.password, user.password);

        if (isPasswordValid) {
            req.session.isAuth = true;
            req.session.userid = user.id;
            req.session.fullname = `${user.name} ${user.surname}`;
            req.session.usercategoryId = user.usercategoryId || user.usercategory.id;

            // Kullanıcıyı ana sayfaya yönlendirmek yerine middleware'in çalışmasını sağla
            return res.redirect("/");
        } else {
            req.session.message = { text: "Şifre yanlış.", class: "danger" };
            return res.redirect("/auth/login");
        }
    } catch (err) {
        console.error("Login error:", err);
        next(err);
    }
};


exports.logout = async (req, res) => {
    try {
        await req.session.destroy(); // Oturumu sonlandır
        res.clearCookie("connect.sid"); // Session cookie'sini temizle
        res.redirect("/auth/login"); // Login sayfasına yönlendir
    } catch (err) {
        console.error("Oturum kapatma sırasında hata:", err);
        res.status(500).send("Oturum kapatılamadı.");
    }
};

exports.getRegister = (req, res, next) => {
    res.render("auth/register", { title: "Kayıt Ol", contentTitle: "Register" });
};

exports.postRegister = async (req, res, next) => {
    const { name, surname, email, password } = req.body;

    // Kullanıcı zaten var mı kontrol et
    const existingUser = await Users.findOne({ where: { email } });
    if (existingUser) {
        req.session.message = { text: "Bu email zaten kayıtlı.", class: "warning" };
        return res.redirect("/auth/register");
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        // Yeni kullanıcı oluştur
        const newUser = await Users.create({
            name,
            surname,
            email,
            password: hashedPassword,
            usercategoryId: 3, // Normal kullanıcı kategorisi (usercategoryId = 3)
        });

        // Oturum bilgilerini oluştur
        req.session.isAuth = true;
        req.session.userid = newUser.id;
        req.session.fullname = `${newUser.name} ${newUser.surname}`;
        req.session.usercategoryId = newUser.usercategoryId;

        // Ana sayfaya yönlendir
        res.redirect("/");
    } catch (err) {
        next(err);
    }
};
