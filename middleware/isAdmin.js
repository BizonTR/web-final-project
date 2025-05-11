module.exports = (req, res, next) => {
    console.log('isAdmin Middleware çalışıyor...');
    console.log('req.session.usercategoryId:', req.session.usercategoryId);

    if (!req.session.isAuth || (req.session.usercategoryId !== 1 && req.session.usercategoryId !== 2)) {
        console.log('Yetkisiz erişim: Kullanıcı admin değil.');
        return res.status(403).render("auth/unauthorized", {
            title: "Yetkisiz Erişim",
            contentTitle: "Yetkisiz Erişim",
        });
    }

    console.log('isAdmin Middleware: Kullanıcı admin, erişime izin veriliyor.');
    next();
};