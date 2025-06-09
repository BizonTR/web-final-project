const { SitemapStream, streamToPromise } = require('sitemap');
const { Readable } = require('stream');
const Game = require('../models/game');
const Users = require('../models/users');
const Announcement = require('../models/announcement');
const slugField = require('./slugfield');
const fs = require('fs');
const path = require('path');

// Sitemap oluşturma fonksiyonu
async function generateSitemap() {
    try {
        // Debug bilgileri ekleyin
        console.log('Sitemap oluşturuluyor...');
        
        // Tüm oyunları ve kullanıcıları veritabanından çek
        const games = await Game.findAll();
        console.log(`${games.length} oyun bulundu`);
        
        const users = await Users.findAll();
        console.log(`${users.length} kullanıcı bulundu`);
        
        // Duyuruları da çek
        const announcements = await Announcement.findAll();
        console.log(`${announcements.length} duyuru bulundu`);
        
        // Statik sayfaları ekleyin
        const links = [
            { url: '/', changefreq: 'daily', priority: 1.0 },
            { url: '/auth/login', changefreq: 'monthly', priority: 0.3 },
            { url: '/auth/register', changefreq: 'monthly', priority: 0.3 },
            // Diğer statik sayfaları ekleyin
            // Eklemek istediğiniz diğer sayfalar...
        ];
        
        // Oyun URL'lerini ekle
        games.forEach(game => {
            links.push({
                url: `/game/${game.id}/${slugField(game.title)}`,
                changefreq: 'weekly',
                priority: 0.7,
                lastmod: game.updatedAt.toISOString()
            });
        });
        
        // Kullanıcı profil URL'lerini ekle
        users.forEach(user => {
            // Admin olmayan tüm aktif kullanıcıları ekle
            // usercategoryId kontrol edilmeli ve ban durumu kontrol edilmeli
            if (user.usercategoryId != 1 && !user.isBanned) { // Admin olmayan ve banlanmamış
                links.push({
                    url: `/user/profile/${user.id}/${slugField(user.name + ' ' + user.surname)}`,
                    changefreq: 'weekly',
                    priority: 0.5
                });
            }
        });
        
        // Duyuru URL'lerini ekle
        announcements.forEach(announcement => {
            links.push({
                url: `/user/announcement/${announcement.id}/${slugField(announcement.title)}`,
                changefreq: 'monthly',
                priority: 0.4,
                lastmod: announcement.updatedAt ? announcement.updatedAt.toISOString() : undefined
            });
        });
        
        console.log(`Toplam ${links.length} URL sitemap'e eklendi`);
        
        // Sitemap stream'i oluştur
        const stream = new SitemapStream({ hostname: 'http:/localhost:3000' }); // Domain adınızı buraya ekleyin
        // Stream'e URL'leri ekle ve XML'e dönüştür
        const data = await streamToPromise(Readable.from(links).pipe(stream));
        // Artık dosyaya kaydetmiyoruz, sadece XML string olarak döndürüyoruz
        return data.toString();
    } catch (error) {
        console.error('Sitemap oluşturma hatası:', error);
        throw error;
    }
}

module.exports = { generateSitemap };