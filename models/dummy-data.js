const Game = require("../models/game");
const Users = require("../models/users");
const userCategory = require("../models/userCategory");
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
            isActive: true,
            url: "https://cdn1.epicgames.com/offer/14ee004dadc142faaaece5a6270fb628/EGS_TheWitcher3WildHuntCompleteEdition_CDPROJEKTRED_S1_2560x1440-82eb5cf8f725e329d3194920c0c0b64f",
            userId: 1,
        });
    }
}

// userCategory verilerini güncelleyelim
const userData = async () => {
    const count = await userCategory.count();
    if (count === 0) {
        await userCategory.bulkCreate([
            { categoryname: "Süper Admin" }, // ID=1
            { categoryname: "Moderatör" },  // ID=2
            { categoryname: "Normal Kullanıcı" } // ID=3
        ]);

        // İlk kullanıcı olarak süper admin oluştur
        const hashedPassword = await bcrypt.hash("admin", 10);
        await Users.create({
            name: "Admin",
            surname: "User",
            email: "admin@example.com",
            password: hashedPassword,
            usercategoryId: 1 // Süper Admin
        });
    }
};

module.exports = populate;
