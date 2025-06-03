const { DataTypes } = require("sequelize");
const db = require("../data/db");

const Announcement = db.define("announcement", {
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
}, { timestamps: true });

module.exports = Announcement;