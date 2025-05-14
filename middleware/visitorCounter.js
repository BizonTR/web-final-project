const VisitorCount = require("../models/visitorcount");
const { Op } = require("sequelize");

module.exports = async (req, res, next) => {
  try {
    // Sadece ana sayfada ve GET istekleri için sayacı arttır
    if (req.path === '/' && req.method === 'GET') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Bugün için kayıt var mı diye kontrol et
      let todayCounter = await VisitorCount.findOne({
        where: {
          date: {
            [Op.eq]: today
          }
        }
      });
      
      if (!todayCounter) {
        // Bugün için ilk ziyaret, yeni kayıt oluştur
        todayCounter = await VisitorCount.create({
          count: 1,
          date: today
        });
      } else {
        // Mevcut günün sayacını arttır
        todayCounter.count += 1;
        await todayCounter.save();
      }
      
      // Toplam ziyaretçi sayısını uygulama genelinde de erişilebilir kıl
      if (!req.app.locals.visitorStats) {
        req.app.locals.visitorStats = {};
      }
    }
    next();
  } catch (error) {
    console.error("Ziyaretçi sayısı güncellenirken hata:", error);
    next();
  }
};