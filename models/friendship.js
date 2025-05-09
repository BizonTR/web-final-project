const { DataTypes } = require("sequelize");
const db = require("../data/db");
const Users = require("./users");

const Friendship = db.define("Friendship", {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    friendId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
});

// İlişki: Arkadaş bilgisi
Friendship.belongsTo(Users, { foreignKey: "friendId", as: "friend" });

module.exports = Friendship;