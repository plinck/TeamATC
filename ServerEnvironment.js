require("dotenv").config();
const ORG = process.env.REACT_APP_FIREBASE_ORG;
const ENV = process.env.REACT_APP_FIREBASE_ENVIRONMENT;

module.exports = {
    ORG: ORG,
    ENV: ENV,
};