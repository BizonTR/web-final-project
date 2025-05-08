const express = require("express");
const adminController = require("../controller/admin");
const isAuth = require("../middleware/isAuth");
const isAdmin = require("../middleware/isAdmin"); // Yeni middleware

router = express.Router();

router.get("/", isAuth, isAdmin, adminController.homePage);

router.get("/add/game", isAuth, isAdmin, adminController.get_addGame);
router.post("/add/game", isAuth, isAdmin, adminController.post_addGame);

router.get("/list/game", isAuth, isAdmin, adminController.listGame);

router.get("/edit/game/:id", isAuth, isAdmin, adminController.get_editGame);
router.post("/edit/game/:id", isAuth, isAdmin, adminController.post_editGame);

router.get("/delete/game/:id", isAuth, isAdmin, adminController.get_deleteGame);
router.post("/delete/game", isAuth, isAdmin, adminController.post_deleteGame);

router.get("/add/user", adminController.get_addUser);
router.post("/add/user", adminController.post_addUser);

router.get("/list/users", adminController.listUser);

router.get("/edit/user/:id", (req, res) => {
    res.send("Siz yazın");
});

router.get("/delete/user/:id", (req, res) => {
    res.send("Siz yazın");
});

router.post("/delete/user", (req, res) => {
    res.send("Siz yazın");
});

router.get("/ckeditor", adminController.ckeditor);

module.exports = router;