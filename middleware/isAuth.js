module.exports = (req, res, next) => {
    console.log('isAuth Middleware çalışıyor...');
    if (!req.session.isAuth) {
        console.log('Yetkisiz erişim: Kullanıcı oturum açmamış.');
        return res.redirect("/auth/login");
    }
    console.log('isAuth Middleware: Kullanıcı oturum açmış.');
    next();
};