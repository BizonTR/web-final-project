const Game = require("../models/game"); // `Anc` yerine `Game`
const Users = require("../models/users");
const userCategory = require("../models/usercategory");
const bcrypt = require("bcrypt");
const slugField = require("../helpers/slugfield");
const { Op, Sequelize } = require("sequelize");
const GameImages = require("../models/gameimages");
const path = require("path");
const fs = require("fs");
const UserBan = require("../models/userban");
const VisitorCount = require("../models/visitorcount");

// Başta gerekli modeli import edelim
const Announcement = require("../models/announcement");

exports.homePage = async (req, res, next) => {
    try {
        // Toplam ziyaretçi sayısını getir
        const totalVisitors = await VisitorCount.sum('count');
        
        // Bugünün ziyaretçi sayısını getir
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todayVisitors = await VisitorCount.findOne({
            attributes: ['count'],
            where: {
                date: {
                    [Op.eq]: today
                }
            }
        });
        
        // Son 7 günün ziyaretçi istatistikleri
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);
        
        const weeklyStats = await VisitorCount.findAll({
            where: {
                date: {
                    [Op.gte]: lastWeek
                }
            },
            order: [['date', 'ASC']]
        });
        
        res.render("admin/index", {
            title: "Admin",
            contentTitle: "Admin Panel",
            userId: req.session.userid,
            fullname: req.session.fullname,
            role: req.session.usercategoryId,
            visitorStats: {
                total: totalVisitors || 0,
                today: todayVisitors ? todayVisitors.count : 0,
                weekly: weeklyStats
            }
        });
    } catch (err) {
        next(err);
    }
};

exports.get_addGame = (req, res, next) => {
    res.render("admin/add-game", { title: "Oyun Ekle", contentTitle: "Add Game Page" });
};

exports.post_addGame = async (req, res, next) => {
    const body = req.body;
    const bannerImage = req.files['bannerImage'] ? req.files['bannerImage'][0] : null;
    const galleryImages = req.files['galleryImages'] || [];

    try {
        // Oyun kaydını oluştur
        const game = await Game.create({
            title: body.title,
            description: body.description,
            url: bannerImage ? `/images/${bannerImage.filename}` : null, // Banner resmi
        });

        // Galeri resimlerini kaydet
        if (galleryImages.length > 0) {
            const imagePaths = galleryImages.map((file) => ({
                imagePath: `/images/${file.filename}`,
                gameId: game.id,
            }));

            await GameImages.bulkCreate(imagePaths); // Resimleri veritabanına kaydet
        }

        req.session.message = { text: "Oyun ve resimler başarıyla eklendi!", class: "success" };
        res.redirect("/admin/list/game");
    } catch (err) {
        next(err);
    }
};

exports.listGame = async (req, res, next) => {
    const searchQuery = req.query.search || ""; // Arama sorgusu
    const currentPage = parseInt(req.query.page) || 1; // Mevcut sayfa
    const itemsPerPage = 5; // Sayfa başına gösterilecek oyun sayısı

    try {
        // Oyunları filtrele ve sayfalama uygula
        const { count, rows } = await Game.findAndCountAll({
            where: {
                title: { [Op.like]: `%${searchQuery}%` }, // Arama sorgusuna göre filtreleme
            },
            include: {
                model: Users,
                attributes: ["name", "surname"],
            },
            limit: itemsPerPage,
            offset: (currentPage - 1) * itemsPerPage,
        });        const totalPages = Math.ceil(count / itemsPerPage);

        res.render("admin/list-game", {
            title: "Oyun Listele",
            contentTitle: "Oyunlar",
            data: rows,
            searchQuery,
            currentPage,
            totalPages,
        });
    } catch (err) {
        next(err);
    }
};

exports.get_editGame = async (req, res, next) => {
    try {
        const selectedData = await Game.findByPk(req.params.id, {
            include: [GameImages], // GameImages ile ilişkili resimleri al
        });        const users = await Users.findAll({ raw: true });

        res.render("admin/edit-game", {
            title: "Oyun Düzenle",
            contentTitle: "Edit Game",
            data: selectedData, // Oyun ve ilişkili resimleri gönder
            users: users,
        });
    } catch (err) {
        return next(err);
    }
};

exports.post_editGame = async (req, res, next) => {
    const gameId = req.params.id;
    const body = req.body;
    const bannerImage = req.files['bannerImage'] ? req.files['bannerImage'][0] : null;
    const galleryImages = req.files['galleryImages'] || [];
    const imagesToDelete = req.body.imagesToDelete || [];

    try {
        const game = await Game.findByPk(gameId);
        if (game) {
            // Oyun bilgilerini güncelle
            game.title = body.title;
            game.description = body.description;

            // Banner resmi güncelleme
            if (bannerImage) {
                if (game.url) {
                    const oldImagePath = path.join(__dirname, "../public", game.url);
                    if (fs.existsSync(oldImagePath)) {
                        fs.unlinkSync(oldImagePath);
                    }
                }
                game.url = `/images/${bannerImage.filename}`;
            }

            await game.save();

            // Galeri resimleri güncelleme
            if (galleryImages.length > 0) {
                const imagePaths = galleryImages.map((file) => ({
                    imagePath: `/images/${file.filename}`,
                    gameId: game.id,
                }));

                await GameImages.bulkCreate(imagePaths);
            }

            // Silinecek resimleri kaldır
            if (imagesToDelete.length > 0) {
                for (const imageId of imagesToDelete) {
                    const image = await GameImages.findByPk(imageId);
                    if (image) {
                        const filePath = path.join(__dirname, "../public", image.imagePath);
                        if (fs.existsSync(filePath)) {
                            fs.unlinkSync(filePath);
                        }
                        await image.destroy();
                    }
                }
            }
        }

        // Başarı mesajı ekle
        req.session.message = { text: "Oyun başarıyla güncellendi!", class: "success" };
        
        // Oyunu düzenleme sayfasına yönlendir, yeni CSRF token'ını URL'de gönder
        // Bu kritik - yeni token'ı URL'de açık bir şekilde gönderiyoruz
        return res.redirect(`/admin/edit/game/${gameId}?_csrf=${req.session.csrfToken}`);
    } catch (err) {
        next(err);
    }
};

exports.get_deleteGame = async (req, res, next) => {
    try {
        const game = await Game.findByPk(req.params.id);
        if (game) {
            game.destroy();
        }
    } catch (err) {
        return next(err);
    }
    res.redirect("/admin/list/game");
};

exports.post_deleteGame = async (req, res, next) => {
    try {
        const game = await Game.findByPk(req.body.gameid);
        if (game) {
            game.destroy();
        }
    } catch (err) {
        return next(err);
    }
    res.redirect("/admin/list/game");
};

exports.get_addUser = async (req, res, next) => {
    const message = req.session.message;
    delete req.session.message;
    const category = await userCategory.findAll({ raw: true });
    res.render("admin/add-user", { title: "Kullanıcı Ekleme", contentTitle: "Add User", category: category, message: message });
};

exports.post_addUser = async (req, res, next) => {
    const selectedData = await Users.findAll({
        where: {
            email: req.body.email,
        },
        raw: true,
    });
    if (selectedData.length > 0) {
        req.session.message = { text: "Kullanıcı var", class: "warning" };
        return res.redirect("/admin/add/user");
    }
    const hashpassword = await bcrypt.hash(req.body.password, 10);

    try {
        Users.create({
            name: req.body.name,
            surname: req.body.surname,
            email: req.body.email,
            password: hashpassword,
            usercategoryId: req.body.category,
        });
    } catch (err) {
        next(err);
    }

    res.redirect("/admin/list/users");
};

exports.listUser = async (req, res, next) => {
    const searchQuery = req.query.search || "";
    const currentPage = parseInt(req.query.page) || 1;
    const itemsPerPage = 5;

    try {
        const searchConditions = {
            [Op.or]: [
                { name: { [Op.like]: `%${searchQuery}%` } },
                { surname: { [Op.like]: `%${searchQuery}%` } },
                { email: { [Op.like]: `%${searchQuery}%` } },
            ],
        };

        const { count, rows } = await Users.findAndCountAll({
            where: searchConditions,
            include: [
                {
                    model: userCategory,
                    attributes: ["id", "categoryname"],
                },
                {
                    model: UserBan,
                    as: "userbans",
                    attributes: ["id", "reason", "bannedUntil", "isActive"],
                    where: { isActive: true },
                    required: false, // LEFT JOIN için
                    // Son aktif banı al
                    order: [["createdAt", "DESC"]],
                    limit: 1
                }
            ],
            limit: itemsPerPage,
            offset: (currentPage - 1) * itemsPerPage,
        });

        const totalPages = Math.ceil(count / itemsPerPage);
        
        // Socket.IO içinde güncellenen global.onlineUsers değişkenini doğrudan al
        const currentOnlineUsers = Array.isArray(global.onlineUsers) ? global.onlineUsers : [];
        
        // Debug bilgisi
        console.log('Online kullanıcılar (controller):', currentOnlineUsers);
        console.log('Online kullanıcı sayısı:', currentOnlineUsers.length);

        res.render("admin/list-user", {
            title: "Kullanıcı Listele",
            contentTitle: "Kullanıcılar",
            data: rows,
            searchQuery,
            currentPage,
            totalPages,
            onlineUsers: currentOnlineUsers,
            session: req.session
        });
    } catch (err) {
        next(err);
    }
};

exports.post_addGameImages = async (req, res, next) => {
    const gameId = req.body.gameId;
    const files = req.files;

    try {
        if (files && files.length > 0) {
            const imagePaths = files.map((file) => ({
                imagePath: `/images/${file.filename}`, // Resim yolu
                gameId: gameId,
            }));

            await GameImages.bulkCreate(imagePaths); // Resimleri veritabanına kaydet
        }
        res.redirect(`/admin/edit/game/${gameId}`);
    } catch (err) {
        next(err);
    }
};

exports.deleteGameImage = async (req, res, next) => {
    const imageId = req.params.id;

    try {
        const image = await GameImages.findByPk(imageId);

        if (!image) {
            return res.status(404).send("Resim bulunamadı.");
        }

        // Resim dosyasını sil
        const filePath = path.join(__dirname, "../public", image.imagePath);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Veritabanından kaydı sil
        await GameImages.destroy({ where: { id: imageId } });

        res.redirect(`/admin/edit/game/${image.gameId}`);
    } catch (err) {
        next(err);
    }
};

exports.ckeditor = (req, res, next) => {
    res.render("admin/ckeditorexample");
};

// Ban uygulama fonksiyonu
exports.banUser = async (req, res, next) => {
    try {
        const { userId, banType, banDuration, reason } = req.body;
        
        // Kullanıcıyı kontrol et
        const user = await Users.findByPk(userId);
        if (!user) {
            req.session.message = { text: "Kullanıcı bulunamadı", class: "danger" };
            return res.redirect("/admin/list/users");
        }
        
        // Admin kendini banlamamalı
        if (parseInt(userId) === req.session.userid) {
            req.session.message = { text: "Kendinizi banlayamazsınız!", class: "danger" };
            return res.redirect("/admin/list/users");
        }
        
        // Moderatör, Süper Admin'i banlayamaz
        if (req.session.usercategoryId === 2 && user.usercategoryId === 1) {
            req.session.message = { text: "Süper Admin'i banlayamazsınız!", class: "danger" };
            return res.redirect("/admin/list/users");
        }
        
        // Moderatör, Admin'i banlayamaz
        if (req.session.usercategoryId === 2 && user.usercategoryId === 1) {
            req.session.message = { text: "Admin'i banlayamazsınız!", class: "danger" };
            return res.redirect("/admin/list/users");
        }
        
        // Mevcut aktif banı deaktif et (varsa)
        await UserBan.update(
            { isActive: false },
            { 
                where: { 
                    userId: userId,
                    isActive: true
                } 
            }
        );
        
        // Ban bitiş tarihi hesapla
        let bannedUntil = null;
        if (banType === 'temporary') {
            bannedUntil = new Date();
            bannedUntil.setDate(bannedUntil.getDate() + parseInt(banDuration));
        }
        
        // Yeni ban oluştur
        await UserBan.create({
            userId: userId,
            reason: reason,
            bannedUntil: bannedUntil,
            isActive: true
        });
        
        req.session.message = { 
            text: `${user.name} ${user.surname} kullanıcısı başarıyla banlandı`, 
            class: "success" 
        };
        
        return res.redirect("/admin/list/users");
    } catch (err) {
        return next(err);
    }
};

// Kullanıcı rolünü değiştirme
exports.changeUserRole = async (req, res, next) => {
    try {
        const { userId, roleId } = req.body;
        
        // Kullanıcıyı kontrol et
        const user = await Users.findByPk(userId);
        if (!user) {
            req.session.message = { text: "Kullanıcı bulunamadı", class: "danger" };
            return res.redirect("/admin/list/users");
        }
        
        // Süper Admin kendisini normal kullanıcı yapamamalı
        if (parseInt(userId) === req.session.userid && roleId !== "1") {
            req.session.message = { text: "Kendi admin yetkilerinizi kaldıramazsınız!", class: "danger" };
            return res.redirect("/admin/list/users");
        }
        
        // Moderatör, Süper Admin'i değiştiremez
        if (req.session.usercategoryId === 2 && user.usercategoryId === 1) {
            req.session.message = { text: "Süper Admin'in rolünü değiştiremezsiniz!", class: "danger" };
            return res.redirect("/admin/list/users");
        }
        
        // Moderatör, Admin'i değiştiremez
        if (req.session.usercategoryId === 2 && user.usercategoryId === 1) {
            req.session.message = { text: "Admin'in rolünü değiştiremezsiniz!", class: "danger" };
            return res.redirect("/admin/list/users");
        }
        
        // Moderatör sadece normal kullanıcı ve moderatör rolü atayabilir
        if (req.session.usercategoryId === 2 && roleId === "1") {
            req.session.message = { text: "Admin rolü atayamazsınız!", class: "danger" };
            return res.redirect("/admin/list/users");
        }
        
        // Kullanıcı rolünü güncelle
        user.usercategoryId = roleId;
        await user.save();
        
        req.session.message = { 
            text: `${user.name} ${user.surname} kullanıcısının rolü başarıyla güncellendi`, 
            class: "success" 
        };
        
        return res.redirect("/admin/list/users");
    } catch (err) {
        return next(err);
    }
};

// Kullanıcı banlarını görüntüleme
exports.getUserBans = async (req, res, next) => {
    try {
        const userId = req.params.id;
        
        // Kullanıcıyı kontrol et
        const user = await Users.findByPk(userId);
        if (!user) {
            req.session.message = { text: "Kullanıcı bulunamadı", class: "danger" };
            return res.redirect("/admin/list/users");
        }
        
        // Kullanıcının tüm banlarını al
        const bans = await UserBan.findAll({
            where: { userId: userId },
            order: [['createdAt', 'DESC']]
        });
        
        res.render("admin/user-bans", {
            title: "Kullanıcı Ban Geçmişi",
            contentTitle: "Ban Geçmişi",
            user: user,
            bans: bans
        });
    } catch (err) {
        return next(err);
    }
};

// Kullanıcı banını kaldırma
exports.removeBan = async (req, res, next) => {
    try {
        const { banId } = req.body;
        
        // Banı kontrol et
        const ban = await UserBan.findByPk(banId);
        if (!ban) {
            req.session.message = { text: "Ban kaydı bulunamadı", class: "danger" };
            return res.redirect("/admin/list/users");
        }
        
        // Banı deaktif et
        ban.isActive = false;
        await ban.save();
        
        req.session.message = { text: "Ban başarıyla kaldırıldı", class: "success" };
        return res.redirect(`/admin/user-bans/${ban.userId}`);
    } catch (err) {
        return next(err);
    }
};

// Kullanıcı silme işlemi
exports.deleteUser = async (req, res, next) => {
    try {
        const userId = req.body.userId;
        
        // Kullanıcıyı kontrol et
        const user = await Users.findByPk(userId);
        if (!user) {
            req.session.message = { text: "Kullanıcı bulunamadı", class: "danger" };
            return res.redirect("/admin/list/users");
        }
        
        // Admin kendini silememeli
        if (parseInt(userId) === req.session.userid) {
            req.session.message = { text: "Kendinizi silemezsiniz!", class: "danger" };
            return res.redirect("/admin/list/users");
        }
        
        // Moderatör, Süper Admin'i silemez
        if (req.session.usercategoryId === 2 && user.usercategoryId === 1) {
            req.session.message = { text: "Süper Admin'i silemezsiniz!", class: "danger" };
            return res.redirect("/admin/list/users");
        }
        
        // Moderatör, Admin'i silemez
        if (req.session.usercategoryId === 2 && user.usercategoryId === 1) {
            req.session.message = { text: "Admin'i silemezsiniz!", class: "danger" };
            return res.redirect("/admin/list/users");
        }
        
        // Kullanıcıyı sil
        await user.destroy();
        
        req.session.message = { 
            text: `${user.name} ${user.surname} kullanıcısı başarıyla silindi`, 
            class: "success" 
        };
        
        return res.redirect("/admin/list/users");
    } catch (err) {
        return next(err);
    }
};

// Duyuru Listesi
exports.listAnnouncements = async (req, res, next) => {
    const searchQuery = req.query.search || "";
    const currentPage = parseInt(req.query.page) || 1;
    const itemsPerPage = 5;

    try {
        // Duyuruları filtrele ve sayfalama uygula
        const { count, rows } = await Announcement.findAndCountAll({
            where: {
                title: { [Op.like]: `%${searchQuery}%` },
            },
            include: {
                model: Users,
                attributes: ["name", "surname"],
            },
            order: [["createdAt", "DESC"]],
            limit: itemsPerPage,
            offset: (currentPage - 1) * itemsPerPage,
        });

        const totalPages = Math.ceil(count / itemsPerPage);

        res.render("admin/list-announcement", {
            title: "Duyuru Listesi",
            contentTitle: "Duyurular",
            data: rows,
            searchQuery,
            currentPage,
            totalPages,
        });
    } catch (err) {
        next(err);
    }
};

// Duyuru Ekleme Sayfası
exports.get_addAnnouncement = (req, res, next) => {
    res.render("admin/add-announcement", { 
        title: "Duyuru Ekle", 
        contentTitle: "Duyuru Ekle" 
    });
};

// Duyuru Ekleme İşlemi
exports.post_addAnnouncement = async (req, res, next) => {
    const { title, content } = req.body;

    try {
        // Duyuru kaydını oluştur
        await Announcement.create({
            title: title,
            content: content,
            userId: req.session.userid
        });

        req.session.message = { text: "Duyuru başarıyla eklendi!", class: "success" };
        res.redirect("/admin/list/announcements");
    } catch (err) {
        next(err);
    }
};

// Duyuru Düzenleme Sayfası
exports.get_editAnnouncement = async (req, res, next) => {
    try {
        const selectedData = await Announcement.findByPk(req.params.id);

        if (!selectedData) {
            req.session.message = { text: "Duyuru bulunamadı!", class: "danger" };
            return res.redirect("/admin/list/announcements");
        }

        res.render("admin/edit-announcement", {
            title: "Duyuru Düzenle",
            contentTitle: "Duyuru Düzenle",
            data: selectedData
        });
    } catch (err) {
        return next(err);
    }
};

// Duyuru Düzenleme İşlemi
exports.post_editAnnouncement = async (req, res, next) => {
    const announcementId = req.params.id;
    const { title, content } = req.body;

    try {
        const announcement = await Announcement.findByPk(announcementId);
        
        if (!announcement) {
            req.session.message = { text: "Duyuru bulunamadı!", class: "danger" };
            return res.redirect("/admin/list/announcements");
        }

        // Duyuru bilgilerini güncelle
        announcement.title = title;
        announcement.content = content;
        announcement.updatedAt = new Date();

        await announcement.save();

        req.session.message = { text: "Duyuru başarıyla güncellendi!", class: "success" };
        res.redirect(`/admin/list/announcements`);
    } catch (err) {
        next(err);
    }
};

// Duyuru Silme İşlemi
exports.get_deleteAnnouncement = async (req, res, next) => {
    try {
        const announcement = await Announcement.findByPk(req.params.id);
        if (announcement) {
            await announcement.destroy();
        }
    } catch (err) {
        return next(err);
    }
    res.redirect("/admin/list/announcements");
};

// Duyuru Silme İşlemi (POST)
exports.post_deleteAnnouncement = async (req, res, next) => {
    try {
        const announcement = await Announcement.findByPk(req.body.announcementId);
        if (announcement) {
            await announcement.destroy();
        }
    } catch (err) {
        return next(err);
    }
    res.redirect("/admin/list/announcements");
};