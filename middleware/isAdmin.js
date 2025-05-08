module.exports = (req, res, next) => {
    if (!req.session.isAuth || req.session.usercategoryId !== 1) {
        // Kullanıcı oturum açmamışsa veya usercategoryId 1 değilse
        return res.status(403).render("auth/unauthorized", {
            title: "Yetkisiz Erişim",
            contentTitle: "Yetkisiz Erişim",
        });
    }
    next(); // Kullanıcı admin ise devam et
};