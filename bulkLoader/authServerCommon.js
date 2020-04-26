"use strict";
require("dotenv").config();
const path = require("path");

// Need to use firebase admin to get at firebase stuff in node
// This will also be used to get a firestore cloud storage on the server
// This gives us access to the *client side APIs* in firebase on node.
const admin = require("firebase-admin");
const storageBucket = "teamatc-challenge.appspot.com";
const databaseURL = "https://teamatc-challenge.firebaseio.com";

const serviceAccount = require(path.join(
    __dirname,
    "./.serviceAccountKey.json"
));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: databaseURL,
    storageBucket: storageBucket
});

module.exports = admin;