const Game = require("../models/game");
const Users = require("../models/users");
const userCategory = require("../models/usercategory");
const bcrypt = require('bcrypt');
const Announcement = require("./announcement");

async function populate() {
    const userCount = await Users.count();
    if (userCount === 0) {
        await userCategory.bulkCreate([
            { categoryname: "Admin" },
            { categoryname: "Moderator" },
            { categoryname: "User" },
            { categoryname: "Editor" },
        ]);

        await Users.create({
            name: "Batuhan",
            surname: "Sütcü",
            email: "batuhan@mail.com",
            password: await bcrypt.hash("123", 10),
            usercategoryId: 1,
        });

        await Users.create({
            name: "Emre",
            surname: "Demir",
            email: "emre@mail.com",
            password: await bcrypt.hash("123", 10),
            usercategoryId: 3,
        });
    }

    const gameCount = await Game.count();
    if (gameCount === 0) {
        await Game.create({
            title: "Witcher 3",
            description: "RPG",
            url: "https://cdn1.epicgames.com/offer/14ee004dadc142faaaece5a6270fb628/EGS_TheWitcher3WildHuntCompleteEdition_CDPROJEKTRED_S1_2560x1440-82eb5cf8f725e329d3194920c0c0b64f",
        });

        // 10 tane daha oyun ekleyelim
        const games = [
            { title: "Shadow Of The Tomb Raider", description: "Adventure", url: "https://salaodejogos.net/wp-content/uploads/2018/09/ShadowofTombRaider.jpg" },
            { title: "Need For Speed: Hot Pursuit Remastered", description: "Race Game", url: "https://media.contentapi.ea.com/content/dam/eacom/need-for-speed-hot-pursuit-remastered/images/2020/09/nfs-youtube-cover-image-16x9-l.jpg.adapt.crop16x9.320w.jpg" },
            { title: "Age Of Empires III: Definitive Edition", description: "Strategy", url: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2477660/capsule_616x353.jpg?t=1691100434" },
            { title: "Red Dead Redemption 2", description: "Western Adventure", url: "https://cdn1.epicgames.com/b30b6d1b4dfd4dcc93b5490be5e094e5/offer/RDR2476298253_Epic_Games_Wishlist_RDR2_2560x1440_V01-2560x1440-2a9ebe1f7ee202102555be202d5632ec.jpg" },
            { title: "Elden Ring", description: "Fantasy RPG", url: "https://image.api.playstation.com/vulcan/img/rnd/202111/0506/hcFeWRVGHYK72uOw6Mn6f4Ms.jpg" },
            { title: "Mount And Blade II: Bannerlord", description: "Medieval", url: "" },
            { title: "Ready Or Not", description: "Shooter, Tactical", url: "" },
            { title: "Stardew Valley", description: "Farm Game", url: "" },
            { title: "Left 4 Dead 2", description: "Shooter, Tactical", url: "" },
            { title: "Phasmophobia", description: "Horror", url: "" },
            { title: "Euro Truck Simulator 2", description: "Truck Driving", url: "" }
        ];

        for (const game of games) {
            await Game.create(game);
        }
    }
    
    // Bu satırı ekleyin
    await addAnnouncements();
}

// Dummy duyuruları ekleyelim
async function addAnnouncements() {
    const count = await Announcement.count();
    if (count === 0) {
        await Announcement.bulkCreate([
            {
                title: "Yeni Oyunlar Eklendi!",
                content: "Sitemize yeni oyunlar eklendi. Hemen inceleyin ve yeni oyunlarımızın keyfini çıkarın. Detaylı bilgi için oyun sayfalarını ziyaret edebilirsiniz.",
                userId: 1,
                createdAt: new Date(2023, 5, 15),
                updatedAt: new Date(2023, 5, 15)
            },
            {
                title: "Sistem Bakımı Duyurusu",
                content: "Değerli kullanıcılarımız, 20 Haziran 2023 tarihinde saat 02:00-04:00 arasında sistem bakımı yapılacaktır. Bu süre zarfında hizmetlerimiz geçici olarak kullanılamayacaktır. Anlayışınız için teşekkür ederiz.",
                userId: 1,
                createdAt: new Date(2023, 5, 18),
                updatedAt: new Date(2023, 5, 18)
            },
            {
                title: "Yeni Özellikler",
                content: "Oyun platformumuza arkadaş ekleme ve mesajlaşma özellikleri eklenmiştir. Artık diğer oyuncularla daha kolay iletişim kurabilirsiniz. Profil sayfanızdan yeni özellikleri hemen keşfedin!",
                userId: 1,
                createdAt: new Date(2023, 6, 5),
                updatedAt: new Date(2023, 6, 5)
            },
            {
                title: "Büyük Yaz İndirimi",
                content: "15 Temmuz - 15 Ağustos tarihleri arasında tüm oyunlarda %50'ye varan indirimler olacaktır. Bu büyük fırsatı kaçırmayın ve en sevdiğiniz oyunları hemen kütüphanenize ekleyin!",
                userId: 1,
                createdAt: new Date(2023, 6, 14),
                updatedAt: new Date(2023, 6, 14)
            }
        ]);
        console.log("Dummy duyurular eklendi");
    }
}

module.exports = populate;
