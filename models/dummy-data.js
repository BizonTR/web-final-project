const Game = require("../models/game");
const Users = require("../models/users");
const userCategory = require("../models/usercategory");
const bcrypt = require('bcrypt');

async function populate() {
    const categoryCount = await userCategory.count();
    if (categoryCount === 0) {
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
            email: "demirkemir@mail.com",
            password: await bcrypt.hash("123", 10),
            usercategoryId: 3,
        });

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
}

module.exports = populate;
