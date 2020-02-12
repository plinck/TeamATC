"use strict";
const admin = require("../middleware/authServerCommon");

// Backend functions for user DB in firestore and auth
class AuthUserAPI {

    // get ALL current claims for user
    static getClaims (uid) {
        return new Promise(async (resolve, reject) => {

            admin.auth().getUser(uid).then((user) => {
                // console.log(`Retrieved users custom claims: ${JSON.stringify(user, null, 4)}`);
                const customClaims = {
                    admin: user.customClaims && user.customClaims.admin ? user.customClaims.admin : false,
                    cashier: user.customClaims && user.customClaims.cashier ? user.customClaims.cashier : false,
                    banker: user.customClaims && user.customClaims.banker ? user.customClaims.banker : false,
                    user: user.customClaims && user.customClaims.user ? user.customClaims.user : false
                };
                resolve(customClaims);
            }).catch(err => {
                // const customClaims = {
                //     admin: false,
                //     cashier: false,
                //     banker: false,
                //     user: false
                // };
                const customClaims = {
                    admin: true,
                    cashier: true,
                    banker: true,
                    user: true
                };
                resolve(customClaims);
            });
        }); // promise
    }

    // Set csutom claim without overrding other claim
    static setClaims (uid, customClaims) {
        return new Promise(async (resolve, reject) => {
            // get current stat of all claims
            let updatedClaims = await this.getClaims(uid);

            // Only update claims passed keeping existing claims
            if (customClaims && customClaims.admin != null) updatedClaims.admin = customClaims.admin;
            if (customClaims && customClaims.cashier != null) updatedClaims.cashier = customClaims.cashier;
            if (customClaims && customClaims.banker != null) updatedClaims.banker = customClaims.banker;
            if (customClaims && customClaims.user != null) updatedClaims.user = customClaims.user;

            // The name is the *primary* role as someone can be admin and banker for example
            if (updatedClaims.admin) {
                updatedClaims.name = "admin";
            } else if (updatedClaims.cashier) {
                updatedClaims.name = "cashier";
            } else if (updatedClaims.banker) {
                updatedClaims.name = "banker";
            } else if (updatedClaims.user) {
                updatedClaims.name = "user";
            } else {
                updatedClaims.name = "noclaims";
            }

            admin.auth().setCustomUserClaims(uid, updatedClaims).then( () => {
                resolve(updatedClaims);
            }).catch(err => {
                console.error("Error updating claims in AuthUserAPI", err);
                resolve(updatedClaims);
            });
        }); // promise
    }
    
}

module.exports = AuthUserAPI;