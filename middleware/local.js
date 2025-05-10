module.exports = (req, res, next) => {
    // Make session data available to all views
    res.locals.session = req.session;
    res.locals.isAuth = req.session.isAuth || false; // Oturum açık mı?
    res.locals.fullname = req.session.fullname || ""; // Kullanıcının tam adı
    res.locals.userid = req.session.userid || null; // Kullanıcının ID'si
    next();
};