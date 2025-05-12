const express = require("express");
const adminController = require("../controller/admin");
const isAuth = require("../middleware/isAuth");
const isAdmin = require("../middleware/isAdmin");
const isSuperAdmin = require("../middleware/isSuperAdmin");
const upload = require("../middleware/upload");

router = express.Router();

// Tüm admin ve moderatörlerin erişebildiği sayfalar
router.get("/", isAuth, isAdmin, adminController.homePage);
router.get("/list/users", isAuth, isAdmin, adminController.listUser);
router.get("/list/game", isAuth, isAdmin, adminController.listGame);
router.get("/add/game", isAuth, isAdmin, adminController.get_addGame);
router.post(
    "/add/game",
    isAuth,
    isAdmin,
    upload.fields([
        { name: "bannerImage", maxCount: 1 }, // Tek bir banner resmi
        { name: "galleryImages", maxCount: 10 }, // En fazla 10 galeri resmi
    ]),
    adminController.post_addGame
);
router.get("/edit/game/:id", isAuth, isAdmin, adminController.get_editGame);

// Hem admin hem moderatörler tarafından kullanılabilen işlemler
router.post("/ban-user", isAuth, isAdmin, adminController.banUser);
router.post("/change-role", isAuth, isAdmin, adminController.changeUserRole);
router.post("/remove-ban", isAuth, isAdmin, adminController.removeBan);
router.get("/user-bans/:id", isAuth, isAdmin, adminController.getUserBans);

// Sadece Süper Admin tarafından kullanılabilen işlemler
router.post("/delete/user", isAuth, isAdmin, isSuperAdmin, adminController.deleteUser);

router.post(
    "/edit/game/:id",
    isAuth,
    isAdmin,
    upload.fields([
        { name: "bannerImage", maxCount: 1 }, // Tek bir banner resmi
        { name: "galleryImages", maxCount: 10 }, // En fazla 10 galeri resmi
    ]),
    adminController.post_editGame
);

router.get("/delete/game/:id", isAuth, isAdmin, adminController.get_deleteGame);
router.post("/delete/game", isAuth, isAdmin, adminController.post_deleteGame);

router.post("/add-game-images", upload.array("images", 10), isAuth, isAdmin, adminController.post_addGameImages);
router.post("/delete-game-image/:id", isAuth, isAdmin, adminController.deleteGameImage);

router.get("/edit/user/:id", (req, res) => {
    res.send("Siz yazın");
});

router.get("/delete/user/:id", (req, res) => {
    res.send("Siz yazın");
});

router.get("/ckeditor", adminController.ckeditor);

module.exports = router;