const session = require('express-session');  
const db=require("../data/db");
const SequelizeStore = require("connect-session-sequelize")(session.Store); //npm install connect-session-sequelize

const configSession=session({
    //google->random guid olarak aratıp oluşturun
    secret:"b985c1b3-6158-483b-af26-ead29962fef8", //oturum verilerinin şifrelenmesinde kullanılır
    resave:false, //sadece session değiştiğinde güncelle
    saveUninitialized:false, //her kullanıcı için session oluştur ya da oluşturma
    cookie:{ //suncu belleğinde oluşturulan session id istemciye cookie olarak taşınır.
       maxAge:1000*60*60*24 //istemciden 24 saat sonra silinsin
                            //logout durumunda kodla silinebilir.
    },
    //veritabanında saklanacaksa ekleyin
   store:new SequelizeStore({
       db:db
    })
}
);

module.exports=configSession;