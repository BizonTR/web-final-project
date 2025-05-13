const crypto = require('crypto');

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

module.exports = () => {
  return (req, res, next) => {
    // Token yoksa oluştur
    if (!req.session.csrfToken) {
      req.session.csrfToken = generateToken();
      
      // Token oluşturduktan sonra session'ı kaydet
      return req.session.save(err => {
        if (err) return next(err);
        
        res.locals.csrfToken = req.session.csrfToken;
        return next();
      });
    }
    
    // Her zaman token'ı view'lar için kullanılabilir yap
    res.locals.csrfToken = req.session.csrfToken;
    
    // GET, HEAD, OPTIONS istekleri için token doğrulama yapma
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return next();
    }

    // POST, PUT, DELETE için token doğrula
    const token = 
      req.query._csrf || 
      req.body._csrf || 
      req.headers['x-csrf-token'];
    
    if (!token || token !== req.session.csrfToken) {
      console.log('CSRF hata detayları:', {
        beklenen: req.session.csrfToken,
        gelen: token
      });
      
      return res.status(403).render('admin/error', { 
        title: 'CSRF Hatası', 
        contentTitle: 'Güvenlik Hatası', 
        err: 'Geçersiz form gönderimi tespit edildi. Güvenlik nedeniyle işleminiz reddedildi.' 
      });
    }
    
    // Form başarılı olduğunda yeni token oluştur ve session'ı kaydet
    const newToken = generateToken();
    req.session.csrfToken = newToken;
    
    return req.session.save(err => {
      if (err) return next(err);
      
      res.locals.csrfToken = newToken;
      next();
    });
  };
};