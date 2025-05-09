const express = require("express");
const friendController = require("../controller/friend");
const router = express.Router();

router.post("/add/:id", friendController.sendFriendRequest);
router.post("/accept/:id", friendController.acceptFriendRequest);
router.post("/reject/:id", friendController.rejectFriendRequest);
router.get("/requests", friendController.getIncomingRequests); // Gelen istekler
router.post("/remove/:id", friendController.removeFriend); // Arkadaşı çıkar
router.post("/remove-request/:id", friendController.removeFriendRequest); // Arkadaşlık isteğini geri al

module.exports = router;