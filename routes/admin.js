const express = require("express");
const adminController = require("../controller/admin");
const isAuth = require("../middleware/isAuth");
const isAdmin = require("../middleware/isAdmin");

const router = express.Router();

router.get("/", isAuth, isAdmin, adminController.homePage);
router.get("/list/users", isAuth, isAdmin, adminController.listUser);

module.exports = router;