const express = require("express");
const router = express.Router();
const userController = require("../controller/user");

router.get("/", userController.getGames); // Ana sayfa için route
router.get("/game/:id/:slug?", userController.getGameDetails);
router.get("/profile/:id/:slug?", userController.getProfileById);

module.exports = router;