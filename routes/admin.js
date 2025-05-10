const express = require("express");
const adminController = require("../controller/admin");
const isAuth = require("../middleware/isAuth");
const isAdmin = require("../middleware/isAdmin"); // Yeni middleware
const upload = require("../middleware/upload");

router = express.Router();

router.get("/", isAuth, isAdmin, adminController.homePage);

router.get("/add/game", isAuth, isAdmin, adminController.get_addGame);
router.post("/add/game", upload.array("images", 10), isAuth, isAdmin, adminController.post_addGame);

router.get("/list/game", isAuth, isAdmin, adminController.listGame);

router.get("/edit/game/:id", isAuth, isAdmin, adminController.get_editGame);
router.post("/edit/game/:id", isAuth, isAdmin, adminController.post_editGame);

router.get("/delete/game/:id", isAuth, isAdmin, adminController.get_deleteGame);
router.post("/delete/game", isAuth, isAdmin, adminController.post_deleteGame);

router.post("/add-game-images", upload.array("images", 10), isAuth, isAdmin, adminController.post_addGameImages);
router.post("/delete-game-image/:id", isAuth, isAdmin, adminController.deleteGameImage);

router.get("/list/users", adminController.listUser);

router.get("/edit/user/:id", (req, res) => {
    res.send("Siz yazın");
});

router.get("/delete/user/:id", (req, res) => {
    res.send("Siz yazın");
});

// Kullanıcı silme route'unu güncelleyelim
router.post("/delete/user", isAuth, isAdmin, adminController.deleteUser);

router.get("/ckeditor", adminController.ckeditor);

// Ban ve rol işlemleri için route'ları kontrol edin
router.post("/ban-user", isAuth, isAdmin, adminController.banUser);
router.post("/change-role", isAuth, isAdmin, adminController.changeUserRole);
router.get("/user-bans/:id", isAuth, isAdmin, adminController.getUserBans); // Bu route var mı?
router.post("/remove-ban", isAuth, isAdmin, adminController.removeBan);

module.exports = router;