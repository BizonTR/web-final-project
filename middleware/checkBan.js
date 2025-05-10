const UserBan = require('../models/userban');
const { Op } = require('sequelize');

module.exports = async (req, res, next) => {
    if (!req.session.isAuth) {
        return next();
    }

    try {
        // Kullanıcının aktif banı var mı kontrol et
        const activeBan = await UserBan.findOne({
            where: {
                userId: req.session.userid,
                isActive: true,
                [Op.or]: [
                    { bannedUntil: null }, // süresiz ban
                    { bannedUntil: { [Op.gt]: new Date() } } // süreli ban ve süresi dolmamış
                ]
            }
        });

        if (activeBan) {
            // Ban süresi dolmuş mu kontrol et
            if (activeBan.bannedUntil && activeBan.bannedUntil < new Date()) {
                // Banın süresini dolduysa, banı deaktif et
                activeBan.isActive = false;
                await activeBan.save();
                return next();
            }
            
            // Kullanıcı oturumunu sonlandır
            req.session.destroy();
            
            // Ban bilgilerini ekleyerek ban sayfasına yönlendir
            return res.render("auth/banned", {
                title: "Hesap Askıya Alındı",
                contentTitle: "Hesabınız Askıya Alındı",
                reason: activeBan.reason,
                bannedUntil: activeBan.bannedUntil
            });
        }

        return next();
    } catch (err) {
        return next(err);
    }
};