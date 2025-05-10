module.exports = (req, res, next) => {
    // Süper Admin veya Moderatör ise admin paneline erişebilir
    if (!req.session.isAuth || (req.session.usercategoryId !== 1 && req.session.usercategoryId !== 2)) {
        return res.status(403).render("auth/unauthorized", {
            title: "Yetkisiz Erişim",
            contentTitle: "Yetkisiz Erişim",
        });
    }
    next();
};