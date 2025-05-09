const Game = require("../models/game"); // `Anc` yerine `Game`
const Users = require("../models/users");
const userCategory = require("../models/usercategory");
const bcrypt = require("bcrypt");
const slugField = require("../helpers/slugfield");
const { Op } = require("sequelize");

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
    const searchQuery = req.query.search || ""; // Arama sorgusu
    const currentPage = parseInt(req.query.page) || 1; // Mevcut sayfa
    const itemsPerPage = 5; // Sayfa başına gösterilecek oyun sayısı

    try {
        // Oyunları filtrele ve sayfalama uygula
        const { count, rows } = await Game.findAndCountAll({
            where: {
                title: { [Op.like]: `%${searchQuery}%` }, // Arama sorgusuna göre filtreleme
            },
            include: {
                model: Users,
                attributes: ["name", "surname"],
            },
            limit: itemsPerPage,
            offset: (currentPage - 1) * itemsPerPage,
        });

        const totalPages = Math.ceil(count / itemsPerPage);

        res.render("admin/list-anc", {
            title: "Oyun Listele",
            contentTitle: "Oyunlar",
            data: rows,
            searchQuery,
            currentPage,
            totalPages,
        });
    } catch (err) {
        next(err);
    }
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
    const searchQuery = req.query.search || ""; // Arama sorgusu
    const currentPage = parseInt(req.query.page) || 1; // Mevcut sayfa
    const itemsPerPage = 5; // Sayfa başına gösterilecek kullanıcı sayısı

    try {
        // Arama sorgusunu dinamik olarak oluştur
        const searchConditions = {
            [Op.or]: [
                { name: { [Op.like]: `%${searchQuery}%` } },
                { surname: { [Op.like]: `%${searchQuery}%` } },
                { email: { [Op.like]: `%${searchQuery}%` } },
            ],
        };

        // Kullanıcıları filtrele ve sayfalama uygula
        const { count, rows } = await Users.findAndCountAll({
            where: searchConditions,
            include: {
                model: userCategory,
                attributes: ["categoryname"],
            },
            limit: itemsPerPage,
            offset: (currentPage - 1) * itemsPerPage,
        });

        const totalPages = Math.ceil(count / itemsPerPage);

        res.render("admin/list-user", {
            title: "Kullanıcı Listele",
            contentTitle: "Kullanıcılar",
            data: rows,
            searchQuery,
            currentPage,
            totalPages,
        });
    } catch (err) {
        next(err);
    }
};

exports.ckeditor = (req, res, next) => {
    res.render("admin/ckeditorexample");
};