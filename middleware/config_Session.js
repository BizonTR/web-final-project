const session = require('express-session');  
const db = require("../data/db");
const SequelizeStore = require("connect-session-sequelize")(session.Store);

const configSession = session({
    secret: "b985c1b3-6158-483b-af26-ead29962fef8",
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
    },
    store: new SequelizeStore({
        db: db
    })
});

module.exports = configSession;