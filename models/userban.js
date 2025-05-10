const { DataTypes } = require("sequelize");
const db = require("../data/db");

const UserBan = db.define("userban", {
    reason: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    bannedUntil: {
        type: DataTypes.DATE,
        allowNull: true, // null ise süresiz ban
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
});

module.exports = UserBan;