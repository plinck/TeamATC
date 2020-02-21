require("dotenv").config();

const ORG=process.env.REACT_APP_FIREBASE_ORG ? process.env.REACT_APP_FIREBASE_ORG : "ATC";
const ENV=process.env.REACT_APP_FIREBASE_ENV ? process.env.REACT_APP_FIREBASE_ENV : "dev";
const USERS_DB="users";

console.log(`using ORG: ${ORG}`);
console.log(`using ENV: ${ENV}`);
console.log(`Users DB: ${USERS_DB}`);
