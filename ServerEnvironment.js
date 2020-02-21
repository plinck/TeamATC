require("dotenv").config();

module.exports = {
    ORG: process.env.REACT_APP_FIREBASE_ORG ? process.env.REACT_APP_FIREBASE_ORG : "ATC",
    ENV: process.env.REACT_APP_FIREBASE_ENV ? process.env.REACT_APP_FIREBASE_ENV : "dev",
    USERS_DB: "users"
};