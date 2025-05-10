const { DataTypes } = require("sequelize");
const db = require("../data/db");
const Game = require("./game");

const GameImages = db.define("GameImages", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    imagePath: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    gameId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Game,
            key: "id",
        },
        onDelete: "CASCADE",
    },
});

module.exports = GameImages;