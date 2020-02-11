"use strict";
require("dotenv");
const path = require("path");

// Need to use firebase admin to get at firebase stuff in node
// This will also be used to get a firestore cloud storage on the server
// This gives us access to the *client side APIs* in firebase on node.
const admin = require("firebase-admin");
const storageBucket = "teamatc-challenge.appspot.com";
const databaseURL = "https://teamatc-challenge.firebaseio.com";

// if  GOOGLE_APPLICATION_CREDENTIALS set, use this file, else, dont send cred since App Engine finds it
if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    const serviceAccount = require(path.join(__dirname, process.env.GOOGLE_APPLICATION_CREDENTIALS));
    console.log(`Deployed Local ${process.env.GOOGLE_APPLICATION_CREDENTIALS}`);
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: databaseURL,
        storageBucket: storageBucket
    });
} else if (process.env.HEROKU_GOOGLE_CREDENTIALS) {
    console.log("Deployed HEROKU_GOOGLE_CREDENTIALS");
    const serviceAccount = JSON.parse(process.env.HEROKU_GOOGLE_CREDENTIALS);
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: databaseURL,
        storageBucket: storageBucket
    });
} else {
    console.log("Deployed To Google Cloud");
    admin.initializeApp({
        databaseURL: databaseURL,
        storageBucket: storageBucket
    });
}

module.exports = admin;