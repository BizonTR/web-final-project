module.exports=(req,res,next)=>{ //session'ı sayfalara parametre olarak göndermek yerine local tanımlanır. Böylece ejs sayfalarından erişilir.
    res.locals.fullname=req.session.fullname;
    next();
}