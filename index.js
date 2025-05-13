const data = require("./data/dataarray");
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const path = require('path');
const bodyParser = require('body-parser'); // post edilen verileri almak için kullanılır.
const session = require('express-session'); // sadece import etmek yeterli değil. middleware klasörü içinde tanımlı config 'de kullanılmalıdır.
const configSession = require("./middleware/config_Session");
const locals = require("./middleware/local");
const notFound = require("./middleware/notFound");
const http = require('http'); // Add this for Socket.IO
const socketIO = require('socket.io'); // Add Socket.IO
const { generateSitemap } = require('./helpers/sitemap');
const fs = require('fs');

// Model'i ekleyelim
const UserBan = require("./models/userban");

const db = require("./data/db");
const dummydata = require("./models/dummy-data");
const Game = require("./models/game"); // Anc yerine Game kullanıldı
const Users = require("./models/users");
const userCategory = require("./models/usercategory");
const Friendship = require("./models/friendship");
const FriendRequest = require("./models/friendrequest");
const GameImages = require("./models/gameimages");
const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const checkBan = require("./middleware/checkBan");
const trackOnlineUsers = require("./middleware/trackOnlineUsers");
const csrfProtection = require("./middleware/csrf"); // Add CSRF middleware

// Online kullanıcı haritası (userId -> socketId)
const onlineUsers = new Map();
// Global erişim için kullanıcı ID'lerini array olarak tut
global.onlineUsers = [];

// Socket.IO bağlantı yönetimi
io.on('connection', (socket) => {
    console.log('Yeni socket bağlantısı:', socket.id);

    // Kullanıcı login olduğunda
    socket.on('user-login', (userId) => {
        console.log(`'user-login' olayı alındı. Kullanıcı ID: ${userId}`);
        userId = parseInt(userId);

        if (!isNaN(userId)) {
            console.log(`Kullanıcı ${userId} socket ID: ${socket.id} ile bağlandı`);
            onlineUsers.set(userId, socket.id);
            
            // Global değişkeni güncelle - NUMBER tipinde ID'ler ile
            global.onlineUsers = Array.from(onlineUsers.keys()).map(id => parseInt(id));
            
            // Güncel online kullanıcıları logla
            console.log('Güncel online kullanıcılar:', global.onlineUsers);
            console.log('Online kullanıcı sayısı:', global.onlineUsers.length);

            // App locals'a da ekle (middleware için)
            app.locals.onlineUsers = global.onlineUsers;

            // Tüm istemcilere güncel online kullanıcı listesini gönder
            io.emit('online-users-update', global.onlineUsers);
        } else {
            console.error('Geçersiz kullanıcı ID:', userId);
        }
    });

    // Socket bağlantısı koptuğunda benzer işlemleri yap
    socket.on('disconnect', () => {
        console.log('Socket bağlantısı koptu:', socket.id);

        // Bağlantısı kopan kullanıcıyı bul ve listeden çıkar
        for (const [userId, socketId] of onlineUsers.entries()) {
            if (socketId === socket.id) {
                onlineUsers.delete(userId);
                
                // Global değişkeni güncelle
                global.onlineUsers = Array.from(onlineUsers.keys());
                
                console.log(`Kullanıcı ${userId} artık çevrimdışı`);

                // Tüm istemcilere güncel online kullanıcı listesini gönder
                io.emit('online-users-update', global.onlineUsers);
                break;
            }
        }
        
        // App locals'a da ekle
        app.locals.onlineUsers = global.onlineUsers;
    });
});

// onlineUsers'ı global olarak erişilebilir yap
app.locals.getOnlineUsers = () => Array.from(onlineUsers.keys());

// EJS Ayarları
app.set("view engine", "ejs");
app.use(expressLayouts); // express-ejs-layouts'u kullan

// Layout Dosyasını Belirleme
app.set("layout", "layout"); // Varsayılan layout dosyası views/layout.ejs olacak

// ---Static
app.use('/static', express.static(path.join(__dirname, 'public')));
// app.use("/ckeditor",express.static(path.join(__dirname,"node_modules/@ckeditor")))
app.use(express.static(path.join(__dirname, "node_modules")));
app.use(express.static(path.join(__dirname, "public")));

// middleware
// Gelen verilerin sadece string olarak ele alnıması istenirse, extended: false özelliği kullanılır, 
// fakat eğer bir JSON nesnesi olarak ele alınması istenirse, extended: true parametresi ile kullanmak gerekir.
app.use(bodyParser.urlencoded({ extended: true }));
app.use(configSession); // Session middleware
app.use(locals); // Locals middleware
app.use(csrfProtection());
// app.use(trackOnlineUsers); // Bu middleware'i kaldırın veya devre dışı bırakın
app.use(checkBan); // Ban kontrolü için ekliyoruz

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

// Mevcut route tanımlamalarından sonra ekleyin
const crypto = require('crypto');

// CSRF token üretme fonksiyonu
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

// CSRF token'ı güncelleyen ve döndüren endpoint
app.get('/get-csrf-token', (req, res) => {
  if (!req.session.csrfToken) {
    req.session.csrfToken = generateToken();
  }
  
  res.json({ 
    csrfToken: req.session.csrfToken,
    message: req.session.message ? req.session.message.text : null
  });
  
  // Mesajı temizle
  delete req.session.message;
});

// Sitemap endpoint'i
app.get('/sitemap.xml', async (req, res) => {
    try {
        // Sitemap dosya yolu
        const sitemapPath = path.join(__dirname, 'public/sitemap.xml');
        
        // Sitemap dosyası varsa ve 24 saatten daha yeni ise, doğrudan onu sun
        if (fs.existsSync(sitemapPath)) {
            const stats = fs.statSync(sitemapPath);
            const fileAge = (new Date().getTime() - stats.mtime.getTime()) / 1000 / 60 / 60; // Saat cinsinden
            
            if (fileAge < 24) {
                return res.sendFile(sitemapPath);
            }
        }
        
        // Sitemap dosyası yoksa veya eskiyse, yeni bir tane oluştur
        const sitemap = await generateSitemap();
        
        res.header('Content-Type', 'application/xml');
        res.send(sitemap);
    } catch (error) {
        console.error('Sitemap endpoint hatası:', error);
        res.status(500).end();
    }
});

// robots.txt endpoint'i
app.get('/robots.txt', (req, res) => {
    res.type('text/plain');
    res.send(`
User-agent: *
Allow: /
Sitemap: ${req.protocol}://${req.get('host')}/sitemap.xml
    `);
});

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

Game.hasMany(GameImages, { foreignKey: "gameId", onDelete: "CASCADE" });
GameImages.belongsTo(Game);

// İlişkileri ekleyelim
Users.hasMany(UserBan, {
    foreignKey: "userId",
    as: "userbans", // views/admin/list-user.ejs'de kullandığımız alias
    onDelete: "CASCADE"
});
UserBan.belongsTo(Users);

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
    
    // İlk sitemap'i oluştur
    try {
        console.log('İlk sitemap oluşturuluyor...');
        await generateSitemap();
        console.log('Sitemap başarıyla oluşturuldu.');
    } catch (error) {
        console.error('Sitemap oluşturma hatası:', error);
    }
})();
// error catch for express
app.use((err, req, res, next) => {
    res.render("admin/error", { title: "Error Page", contentTitle: "Error Page", err: err });
    console.log("Hatamız=", err);
});

app.use(notFound); // 404 sayfası için middleware

server.listen(3000, () => {
    console.log("Server port 3000 üzerinde çalışıyor");
});


