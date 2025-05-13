const slugField = require("../helpers/slugfield");

module.exports = (req, res, next) => {
    // Make session data available to all views
    res.locals.session = req.session;
    res.locals.isAuth = req.session.isAuth || false;
    res.locals.fullname = req.session.fullname || "";
    res.locals.userid = req.session.userid || null;

    // Online kullanıcıları doğrudan global'den al
    res.locals.onlineUsers = Array.isArray(global.onlineUsers) ? global.onlineUsers : [];
    
    // Ayrıca app.locals'dan da al (ikincil kontrol)
    if (!res.locals.onlineUsers.length && Array.isArray(req.app.locals.onlineUsers)) {
        res.locals.onlineUsers = req.app.locals.onlineUsers;
    }
    
    res.locals.slugField = require("../helpers/slugfield");

    next();
};