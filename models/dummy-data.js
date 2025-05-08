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
            usercategoryId: 1,
        });

        await Game.create({
            title: "Final Schedule",
            description: "Lorem ipsum dolor sit amet consectetur adipisicing elit.",
            isActive: true,
            url: "http://example.com/final-schedule",
            userId: 1,
        });
    }
}

module.exports = populate;
