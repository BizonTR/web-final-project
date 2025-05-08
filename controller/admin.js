const Game = require("../models/game"); // `Anc` yerine `Game`
const Users = require("../models/users");
const userCategory = require("../models/usercategory");
const bcrypt = require("bcrypt");
const slugField = require("../helpers/slugfield");

exports.homePage = (req, res, next) => {
    res.render("admin/index", { title: "Ana sayfa", contentTitle: "Admin Home Page" });
};

exports.get_addGame = (req, res, next) => {
    res.render("admin/add-anc", { title: "Oyun Ekle", contentTitle: "Add Game Page" }); // `anc` yerine `game`
};

exports.post_addGame = async (req, res, next) => {
    const body = req.body;
    const isActive = body.isActive ? true : false;
    const userid = req.session.userid;
    try {
        await Game.create({
            title: body.title,
            description: body.explain,
            isActive: isActive,
            userId: userid,
            url: slugField(body.title),
        });
    } catch (err) {
        return next(err);
    }
    res.redirect("/admin/list/game");
};

exports.listGame = async (req, res, next) => {
    const selectedData = await Game.findAll({
        include: {
            model: Users,
            attributes: ["name", "surname"],
        },
    });
    res.render("admin/list-anc", { title: "Oyun Listele", contentTitle: "List Games", data: selectedData }); // `anc` yerine `game`
};

exports.get_editGame = async (req, res, next) => {
    try {
        const selectedData = await Game.findAll({
            where: { id: req.params.id },
            raw: true,
        });

        const users = await Users.findAll({ raw: true });

        res.render("admin/edit-anc", { title: "Oyun Düzenle", contentTitle: "Edit Game", data: selectedData[0], users: users }); // `anc` yerine `game`
    } catch (err) {
        return next(err);
    }
};

exports.post_editGame = async (req, res, next) => {
    const isActive = req.body.isActive == "on" ? true : false;
    try {
        const game = await Game.findByPk(req.body.noticeid);
        if (game) {
            game.title = req.body.title;
            game.description = req.body.explain;
            game.isActive = isActive;
            game.userId = req.body.user;
            game.url = slugField(req.body.title);
            game.save();
        }
    } catch (err) {
        return next(err);
    }

    res.redirect("/admin/list/game");
};

exports.get_deleteGame = async (req, res, next) => {
    try {
        const game = await Game.findByPk(req.params.id);
        if (game) {
            game.destroy();
        }
    } catch (err) {
        return next(err);
    }
    res.redirect("/admin/list/game");
};

exports.post_deleteGame = async (req, res, next) => {
    try {
        const game = await Game.findByPk(req.body.ancid);
        if (game) {
            game.destroy();
        }
    } catch (err) {
        return next(err);
    }
    res.redirect("/admin/list/game");
};

exports.get_addUser = async (req, res, next) => {
    const message = req.session.message;
    delete req.session.message;
    const category = await userCategory.findAll({ raw: true });
    res.render("admin/add-user", { title: "Kullanıcı Ekleme", contentTitle: "Add User", category: category, message: message });
};

exports.post_addUser = async (req, res, next) => {
    const selectedData = await Users.findAll({
        where: {
            email: req.body.email,
        },
        raw: true,
    });
    if (selectedData.length > 0) {
        req.session.message = { text: "Kullanıcı var", class: "warning" };
        return res.redirect("/admin/add/user");
    }
    const hashpassword = await bcrypt.hash(req.body.password, 10);

    try {
        Users.create({
            name: req.body.name,
            surname: req.body.surname,
            email: req.body.email,
            password: hashpassword,
            usercategoryId: req.body.category,
        });
    } catch (err) {
        next(err);
    }

    res.redirect("/admin/list/users");
};

exports.listUser = async (req, res, next) => {
    const selectedData = await Users.findAll({
        attributes: ["name", "surname", "password", "id"],
        include: {
            model: userCategory,
            attributes: ["categoryname"],
        },
    });
    res.render("admin/list-user", { title: "User Listele", contentTitle: "List Users", data: selectedData });
};

exports.ckeditor = (req, res, next) => {
    res.render("admin/ckeditorexample");
};