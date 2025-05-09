const FriendRequest = require("../models/friendrequest");
const Friendship = require("../models/friendship");
const Users = require("../models/users");

exports.sendFriendRequest = async (req, res, next) => {
    const senderId = req.session.userid;
    const receiverId = req.params.id;

    if (senderId === receiverId) {
        return res.status(400).send("Kendinize arkadaşlık isteği gönderemezsiniz.");
    }

    try {
        const existingRequest = await FriendRequest.findOne({
            where: { senderId, receiverId },
        });

        if (existingRequest) {
            return res.status(400).send("Zaten bir arkadaşlık isteği gönderdiniz.");
        }

        await FriendRequest.create({ senderId, receiverId });
        res.redirect(`/user/profile/${receiverId}`);
    } catch (err) {
        next(err);
    }
};

exports.acceptFriendRequest = async (req, res, next) => {
    const receiverId = req.session.userid; // Oturum açmış kullanıcının ID'si
    const senderId = req.params.id; // İsteği gönderen kullanıcının ID'si

    try {
        // İsteği bul
        const request = await FriendRequest.findOne({
            where: { senderId, receiverId, status: "pending" },
        });

        if (!request) {
            return res.status(404).send("Arkadaşlık isteği bulunamadı.");
        }

        // Arkadaşlık ilişkisi oluştur
        await Friendship.create({ userId: receiverId, friendId: senderId });
        await Friendship.create({ userId: senderId, friendId: receiverId });

        // İsteği sil
        await request.destroy();

        res.redirect(`/friend/requests`);
    } catch (err) {
        next(err);
    }
};

exports.rejectFriendRequest = async (req, res, next) => {
    const receiverId = req.session.userid; // Oturum açmış kullanıcının ID'si
    const senderId = req.params.id; // İsteği gönderen kullanıcının ID'si

    try {
        // İsteği bul
        const request = await FriendRequest.findOne({
            where: { senderId, receiverId, status: "pending" },
        });

        if (!request) {
            return res.status(404).send("Arkadaşlık isteği bulunamadı.");
        }

        // İsteği sil
        await request.destroy();

        res.redirect(`/friend/requests`);
    } catch (err) {
        next(err);
    }
};

exports.getIncomingRequests = async (req, res, next) => {
    const userId = req.session.userid; // Oturum açmış kullanıcının ID'si

    try {
        // Gelen arkadaşlık isteklerini al
        const requests = await FriendRequest.findAll({
            where: {
                receiverId: userId,
                status: "pending", // Sadece bekleyen istekler
            },
            include: [
                {
                    model: Users,
                    as: "sender", // Gönderen kullanıcı bilgilerini al
                    attributes: ["id", "name", "surname"],
                },
            ],
        });

        res.render("user/requests", {
            title: "Gelen Arkadaşlık İstekleri",
            contentTitle: "Gelen İstekler",
            requests: requests,
        });
    } catch (err) {
        next(err);
    }
};

exports.removeFriend = async (req, res, next) => {
    const userId = req.session.userid; // Oturum açmış kullanıcının ID'si
    const friendId = req.params.id; // Silmek istediğimiz arkadaşın ID'si

    try {
        // İki yönlü arkadaşlık ilişkisini sil
        await Friendship.destroy({
            where: {
                userId: userId,
                friendId: friendId,
            },
        });

        await Friendship.destroy({
            where: {
                userId: friendId,
                friendId: userId,
            },
        });

        res.redirect(`/user/profile/${friendId}`);
    } catch (err) {
        next(err);
    }
};

exports.removeFriendRequest = async (req, res, next) => {
    const senderId = req.session.userid; // Oturum açmış kullanıcının ID'si
    const receiverId = req.params.id; // İsteği gönderdiğimiz kullanıcının ID'si

    try {
        // Gönderilmiş isteği bul ve sil
        const request = await FriendRequest.findOne({
            where: {
                senderId: senderId,
                receiverId: receiverId,
                status: "pending",
            },
        });

        if (!request) {
            return res.status(404).send("Arkadaşlık isteği bulunamadı.");
        }

        await request.destroy(); // İsteği sil

        res.redirect(`/user/profile/${receiverId}`);
    } catch (err) {
        next(err);
    }
};