//const authData=require("../data/authdata");
const Users=require("../models/users")
const session = require("express-session");
const bcrypt = require('bcrypt');
//const db=require("../data/db");

exports.getLogin=(req,res,next)=>{
    const message=req.session.message;
    console.log("mesaj",message);
    delete req.session.message;//sadece message session silinir. destroy tümünü siler.
    res.render("auth/login",{title:"Login",contentTitle:"Login",message:message});
}


exports.postLogin=async(req,res,next)=>{
    console.log(req.body);

    //const user=authData.find(x=>x.email==req.body.email);
    //const user=await db.execute("SELECT * FROM users WHERE email=?",[req.body.email]);
    const user=await Users.findAll({
        where:{
            email:req.body.email
        },
        raw:true
    })

    console.log(user);

    if (user.length==0) {
        req.session.message={text:"Email hatalı",class:"warning"}
        console.log("mesaj1=",req.session.message);
        return res.redirect("login");
    }
      
    if (await bcrypt.compare(req.body.password,user[0].password)){ //şifre uyuşuyorsa
        req.session.isAuth=1;
        req.session.userid=user[0].id; //duyuru kaydı yapan kullanıcı ID'si duyuru eklenirken veri tabanına yazılacak
        req.session.fullname=user[0].name+" "+user[0].surname;
        const url=req.query.url || "/admin/list/anc"; //req.query.url varsa onu yoksa "/admin/list/anc" url olarak kabul et.
        return res.redirect(url);
    }
    
    //şifre uyuşmuyorsa
    req.session.message={text:"Şifre hatalı",class:"warning"};
    return res.redirect("login");
}


    exports.signout=async(req,res)=>{
        await req.session.destroy(); //session temizle
        res.redirect("/auth/login"); //ana sayfaya git
    }
