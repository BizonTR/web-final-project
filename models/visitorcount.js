const { DataTypes } = require("sequelize");
const db = require("../data/db");

const VisitorCount = db.define(
  "VisitorCount",
  {
    count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      unique: true
    }
  },
  { timestamps: true }
);

module.exports = VisitorCount;