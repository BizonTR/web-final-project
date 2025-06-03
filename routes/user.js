const express = require("express");
const router = express.Router();
const userController = require("../controller/user");

router.get("/", userController.userHome); // Ana sayfa için route
router.get("/game/:id/:slug?", userController.getGameDetails);
router.get("/profile/:id/:slug?", userController.getProfileById);
// Duyuru detay sayfası
router.get("/announcement/:id/:slug?", userController.getAnnouncementDetails);

module.exports = router;