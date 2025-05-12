const UserBan = require('../models/userban');
const { Op } = require('sequelize');

module.exports = async (req, res, next) => {
    if (!req.session.isAuth) {
        return next(); // Kullanıcı oturum açmamışsa devam et
    }

    try {
        // Eğer kullanıcı /auth/logout rotasına gidiyorsa, ban kontrolü yapmadan devam et
        if (req.path === "/auth/logout") {
            return next();
        }

        // Kullanıcının aktif banı var mı kontrol et
        const activeBan = await UserBan.findOne({
            where: {
                userId: req.session.userid,
                isActive: true,
                [Op.or]: [
                    { bannedUntil: null }, // Süresiz ban
                    { bannedUntil: { [Op.gt]: new Date() } } // Süreli ban ve süresi dolmamış
                ]
            }
        });

        if (activeBan) {
            // Ban süresi dolmuş mu kontrol et
            if (activeBan.bannedUntil && activeBan.bannedUntil < new Date()) {
                // Ban süresi dolmuşsa, banı deaktif et
                activeBan.isActive = false;
                await activeBan.save();
                return next(); // Kullanıcıyı normal şekilde devam ettir
            }

            // Banlı kullanıcıya "Banlı" ekranını göster
            return res.render("auth/banned", {
                title: "Hesap Askıya Alındı",
                contentTitle: "Hesabınız Askıya Alındı",
                reason: activeBan.reason,
                bannedUntil: activeBan.bannedUntil,
                fullname: req.session.fullname, // Navbar için fullname gönder
            });
        }

        return next(); // Kullanıcı banlı değilse devam et
    } catch (err) {
        console.error("Ban kontrolü sırasında hata oluştu:", err);
        return next(err);
    }
};