const data=require("../data/dataarray");
const Anc=require("../models/game");
const Users=require("../models/users");
const userCategory=require("../models/usercategory");
const bcrypt = require('bcrypt');
const slugField=require("../helpers/slugfield");

exports.homePage=(req,res,next)=>{
    // res.send("Ana Sayfa");
    res.render("admin/index",{title:"Ana sayfa",contentTitle:"Admin Home Page"});
}

exports.get_addAnc=(req,res,next)=>{
    // res.status(200).send("Duyuru Ekleme");
    res.render("admin/add-anc",{title:"Duyuru Ekle",contentTitle:"Add Anouncment Page"});
}

exports.post_addAnc=async(req,res,next)=>{
    const body=req.body;
    const isActive=body.isActive?true:false
    const userid=req.session.userid;
try{
   await Anc.create({
            title:body.title,
            exp:body.explain,
            isactive:isActive,
            userId:userid,
            url:slugField(body.title)
        });
}
catch(err){
    //hata varsa index.js'deki bir sonraki middleware'e geçer. O da hata kontrolü middleware'idir. Ona hatayı paraetre olarak gönderir.
    //Böylece bir noktadan tüm hatalar ele alınmış olur.
    return next(err); 
}
 res.redirect("/admin/list/anc");
}

exports.listAnc=async(req,res,next)=>{
    
    //const selectedData=await db.execute("SELECT * FROM anc");
    const selectedData=await Anc.findAll({
        include:{
            model:Users,
            attributes:["name","surname"]
        }
    });
    //console.log(selectedData);
    res.render("admin/list-anc",{title:"Duyuru Listele",contentTitle:"List Anouncment",data:selectedData});
}

exports.get_editAnc=async(req,res,next)=>{
    try{
        
        //const selectedData=await db.execute("SELECT * FROM anc WHERE noticeid=?",[req.params.id]);
        const selectedData=await Anc.findAll({
            where:{id:req.params.id}, //edit-anc.ejs dosyasında formdaki data.noticeid'yi data.id olarak güncelleyin.
            raw:true
        });

        const users=await Users.findAll({raw:true});

        console.log("edit:",selectedData);
        res.render("admin/edit-anc",{title:"Duyuru Düzeltme",contentTitle:"Edit Anouncment",data:selectedData[0],users:users});
    }
    catch(err){
        return next(err);
    }
    
}

exports.post_editAnc=async(req,res,next)=>{
    const isActive=req.body.isActive=="on"?true:false;
    console.log("aktif:",isActive)
    try{
        //await db.execute("UPDATE anc SET title=?,exp=?,isactive=? WHERE noticeid=?",
        //[req.body.title,req.body.explain,isActive,req.body.noticeid]);
       const anc=await Anc.findByPk(req.body.noticeid)
       if (anc){
        anc.title=req.body.title;
        anc.exp=req.body.explain;
        anc.isactive=isActive;
        anc.userId=req.body.user;
        anc.url=slugField(req.body.title);
        anc.save();  
       }
          
    }
    catch(err){
        return next(err);
    }

    res.redirect("/admin/list/anc");
    // console.log(oldData);
    // res.render("admin/edit-anc",{title:"Duyuru Düzeltme",contentTitle:"Edit Anouncment",data:oldData});
}

//Bu silme işlemi için birinci yöntem. ModalBox içine bir link buton yerleştirdik ve bu butona
// link olarak /delete/anc/:id route'ını yerleştirdik ve silme işlemini get route ile gerçekleştiridk.
//Ancak aşağıdaki ikinci yöntem daha güvenlidir.
exports.get_deleteAnc=async(req,res,next)=>{
    try{
        //await db.execute("DELETE from anc WHERE noticeid=?",
        //[req.params.id]);
        const anc= await Anc.findByPk(req.params.id);
        if(anc){
            anc.destroy();
        }

    }
    catch(err){
        return next(err);
    }
    res.redirect("/admin/list/anc");
}

//Silme işlemini iki şekilde yaptık
//Modalbox içine form yerleştirerek post işlemi gerçekleştirdik ve hidden input içine yerleştirdiğimiz 
//Id ile silme işlemini yaptık
exports.post_deleteAnc=async(req,res,next)=>{
    try{
        //await db.execute("DELETE from anc WHERE noticeid=?",
        //[req.body.ancid]);
        const anc= await Anc.findByPk(req.body.ancid);
        if(anc){
            anc.destroy();
        }
    }
    catch(err){
        return next(err);
    }
    res.redirect("/admin/list/anc");
}


exports.get_addUser=async(req,res,next)=>{
    const message=req.session.message;
    delete req.session.message;
    //const category=await db.execute("SELECT * FROM userkategori");
    //console.log(category[0]);
    const category=await userCategory.findAll({raw:true});
    res.render("admin/add-user",{title:"Kullanıcı Ekleme",contentTitle:"Add User",category:category, message:message});
}

exports.post_addUser=async(req,res,next)=>{
    console.log(req.body.category);
    //const selectedData=await db.execute("SELECT * FROM users WHERE email=?",[req.body.email]);
    const selectedData=await Users.findAll(
        {where:{
            email:req.body.email,
        },
            raw:true
        });
    console.log(selectedData);
    if (selectedData.length>0){
        req.session.message={text:"Kullanıcı var",class:"warning"}
        //console.log("mesaj1=",req.session.message);
        return res.redirect("/admin/add/user");
    }
    hashpassword=await bcrypt.hash(req.body.password,10);
    
    try{
        Users.create({
            name:req.body.name,
            surname:req.body.surname,
            email:req.body.email,
            password:hashpassword,
            usercategoryId:req.body.category
        });
    }
    catch(err){
        next(err);
    }
    // await db.execute("INSERT INTO users (name,surname,email,password,categoryid) VALUES (?,?,?,?,?)",
    //                                     [req.body.name,req.body.surname,req.body.email,hashpassword,req.body.category]);
    
    res.redirect("/admin/list/users")
}

exports.listUser=async(req,res,next)=>{
    //const selectedData=await db.execute("SELECT * FROM users as u, userkategori as c where u.categoryid=c.categoryid");
    const selectedData=await Users.findAll({
        attributes:['name','surname','password',"id"],
        include:{
            model:userCategory,
            attributes:["categoryname"]
        }//,
        //raw:true //raw kullanılmazsa iyi olur. raw kullanılırsa category bilgisi string gelir. nesne propertysi olarak gelmez.
    })
    console.log(selectedData)
                                            //liste içinde liste döner. Bu nedenle [0] indisli eleman alınır
    res.render("admin/list-user",{title:"User Listele",contentTitle:"List Users",data:selectedData});
}

exports.ckeditor=(req,res,next)=>{
 res.render("admin/ckeditorexample");
}