const { Sequelize } = require("sequelize");

const db = new Sequelize("anouncmentseq", "root", "970300", {
  host: "localhost", // veya docker-compose kullanıyorsan: "mysql"
  dialect: "mysql"
});

async function connect() {
  try {
    await db.authenticate();
    console.log("Veritabanına bağlanıldı");
  } catch (error) {
    console.error("Veritabanına bağlanılamadı:", error);
  }
}

connect();

module.exports = db;
