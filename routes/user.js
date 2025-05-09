const express = require("express");
const router = express.Router();
const userController = require("../controller/user");

router.get("/", userController.getGames); // Ana sayfa için route
router.get("/game/:id", userController.getGameDetails); // Oyun detay sayfası için route
router.get("/profile/:id", userController.getProfileById);

module.exports = router;