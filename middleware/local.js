module.exports = (req, res, next) => {
    res.locals.isAuth = req.session.isAuth || false; // Oturum açık mı?
    res.locals.fullname = req.session.fullname || ""; // Kullanıcının tam adı
    next();
};