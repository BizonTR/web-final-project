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
    try {
        const user = await Users.findOne({ 
            where: { email: req.body.email },
            include: [{ model: userCategory, attributes: ['id'] }] // Kullanıcı kategorisini dahil et
        });

        if (!user) {
            return res.redirect('/auth/login');
        }

        const isPasswordValid = await bcrypt.compare(req.body.password, user.password);

        if (isPasswordValid) {
            req.session.isAuth = true;
            req.session.userid = user.id; // Kullanıcı ID'sini session'a kaydet
            req.session.fullname = `${user.name} ${user.surname}`;
            req.session.usercategoryId = user.usercategoryId || user.usercategory.id; // Kullanıcı kategorisini session'a kaydet

            console.log('User logged in:', {
                id: user.id,
                name: user.name,
                categoryId: req.session.usercategoryId,
            });

            return res.redirect('/');
        } else {
            return res.redirect('/auth/login');
        }
    } catch (err) {
        console.error('Login error:', err);
        next(err);
    }
};


exports.logout = async (req, res) => {
    try {
        // Store user ID before destroying session
        const userId = req.session.userid;
        
        await req.session.destroy();
        res.redirect("/auth/login");
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
