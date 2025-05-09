const { DataTypes } = require("sequelize");
const db = require("../data/db");
const Users = require("./users");

const FriendRequest = db.define("FriendRequest", {
    senderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    receiverId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM("pending", "accepted", "rejected"),
        defaultValue: "pending",
    },
});

// İlişki: Gönderen kullanıcı
FriendRequest.belongsTo(Users, { foreignKey: "senderId", as: "sender" });

module.exports = FriendRequest;