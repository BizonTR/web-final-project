const express = require("express");
const authController = require("../controller/auth");
const router = express.Router();

router.get("/login", authController.getLogin);
router.post("/login", authController.postLogin);
router.get("/register", authController.getRegister); // Yeni kayıt rotası
router.post("/register", authController.postRegister); // Yeni kayıt rotası
router.get("/logout", authController.logout);

router.get("/session", (req, res) => {
    res.json({
        isAuth: req.session.isAuth || false,
        fullname: req.session.fullname || "",
        userid: req.session.userid || null,
    });
});

module.exports = router;