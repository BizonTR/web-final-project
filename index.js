const data = require("./data/dataarray");
const express = require("express");
const path = require('path');
const bodyParser = require('body-parser'); // post edilen verileri almak için kullanılır.
const session = require('express-session'); // sadece import etmek yeterli değil. middleware klasörü içinde tanımlı config 'de kullanılmalıdır.
const configSession = require("./middleware/config_Session");
const locals = require("./middleware/local");
const notFound = require("./middleware/notFound");

const db = require("./data/db");
const dummydata = require("./models/dummy-data");
const Game = require("./models/game"); // Anc yerine Game kullanıldı
const Users = require("./models/users");
const userCategory = require("./models/usercategory");
const Friendship = require("./models/friendship");
const FriendRequest = require("./models/friendrequest");
const app = express();

// set view engine
app.set('view engine', 'ejs');

// ---Static
app.use('/static', express.static(path.join(__dirname, 'public')));
// app.use("/ckeditor",express.static(path.join(__dirname,"node_modules/@ckeditor")))
app.use(express.static(path.join(__dirname, "node_modules")));

// middleware
// Gelen verilerin sadece string olarak ele alnıması istenirse, extended: false özelliği kullanılır, 
// fakat eğer bir JSON nesnesi olarak ele alınması istenirse, extended: true parametresi ile kullanmak gerekir.
app.use(bodyParser.urlencoded({ extended: true }));
app.use(configSession);
app.use(locals);

// ---routes
const adminRouter = require("./routes/admin");
const userRouter = require("./routes/user");
const authRouter = require("./routes/auth");
const friendRouter = require("./routes/friend");
app.use("/admin", adminRouter);
app.use("/user", userRouter);
app.use("/auth", authRouter);
app.use("/friend", friendRouter);
app.use("/", userRouter);

// İlişkiler
Users.hasMany(Game, { // Anc yerine Game kullanıldı
    foreignKey: {
        allowNull: false,
        defaultValue: 1
    },
    onDelete: "RESTRICT", // "SET NULL", //"RESTRICT", //Default değer->"CASCADE" "RESTRICT" yapılırsa kategoriye bağlı blog olduğunda hata verir. Sildirmez.
    onUpdate: "RESTRICT"
});

Game.belongsTo(Users); // Anc yerine Game kullanıldı

userCategory.hasMany(Users, {
    foreignKey: {
        allowNull: false,
        defaultValue: 1
    },
    onDelete: "RESTRICT", // "SET NULL", //"RESTRICT", //Default değer->"CASCADE" "RESTRICT" yapılırsa kategoriye bağlı blog olduğunda hata verir. Sildirmez.
    onUpdate: "RESTRICT"
});
Users.belongsTo(userCategory);

Users.hasMany(Friendship, { foreignKey: "userId" });
Users.hasMany(Friendship, { foreignKey: "friendId" });

Users.hasMany(FriendRequest, { foreignKey: "senderId" });
Users.hasMany(FriendRequest, { foreignKey: "receiverId" });

// uygulanması
// --await çağrıları mutlaka async fonnksiyon içinde olmalıdır.
// --fonksiyon aşağıdaki gibi hem oluşturulup hem de çağrılabilir.
(async () => {
    // data/db'den oluşturulan sequilize nesnesi vasıtasıyla 
    // veri tabanında değişiklikleri senkronize et
    //await db.sync({ alter: true }); // değişiklik varsa yeniden oluştur
    await db.sync({force:true});//her zaman sil ve yeniden oluştur
    // --tablolarda veri yoksa ilk verileri ekle
    await dummydata();
})();
// error catch for express
app.use((err, req, res, next) => {
    res.render("admin/error", { title: "Error Page", contentTitle: "Error Page", err: err });
    console.log("Hatamız=", err);
});

app.use(notFound); // 404 sayfası için middleware

app.listen(3000, () => {
    console.log("Server running");
});


