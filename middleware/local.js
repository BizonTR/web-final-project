module.exports = (req, res, next) => {
    // Make session data available to all views
    res.locals.session = req.session;
    res.locals.isAuth = req.session.isAuth || false;
    res.locals.fullname = req.session.fullname || "";
    res.locals.userid = req.session.userid || null; // Kullanıcı ID'sini session'dan al

    // Get online users from app.locals
    res.locals.onlineUsers = req.app.locals.getOnlineUsers ? req.app.locals.getOnlineUsers() : [];

    // Debug için log ekleyin
    console.log('Middleware: res.locals.userid:', res.locals.userid);

    next();
};