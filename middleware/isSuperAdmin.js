module.exports = (req, res, next) => {
    // Sadece Süper Admin (usercategoryId=1) belirli işlemleri yapabilir
    if (!req.session.isAuth || req.session.usercategoryId !== 1) {
        req.session.message = { 
            text: "Bu işlemi sadece Süper Admin yapabilir", 
            class: "danger" 
        };
        return res.redirect("/admin");
    }
    next();
};