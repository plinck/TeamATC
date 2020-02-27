"use strict";
const admin = require("../middleware/authServerCommon");
const Util = require("./Util.js");

// Backend functions for user DB in firestore and auth
class AuthUserAPI {

    // get ALL current claims for user
    static getClaims (uid) {
        return new Promise(async (resolve, reject) => {

            admin.auth().getUser(uid).then((user) => {
                // console.log(`Retrieved users custom claims: ${JSON.stringify(user, null, 4)}`);
                const customClaims = {
                    admin: user.customClaims && user.customClaims.admin ? user.customClaims.admin : false,
                    teamLead: user.customClaims && user.customClaims.teamLead ? user.customClaims.teamLead : false,
                    moderator: user.customClaims && user.customClaims.moderator ? user.customClaims.moderator : false,
                    user: user.customClaims && user.customClaims.user ? user.customClaims.user : false
                };
                resolve(customClaims);
            }).catch(err => {
                // const customClaims = {
                //     admin: false,
                //     teamLead: false,
                //     moderator: false,
                //     user: false
                // };
                const customClaims = {
                    admin: true,
                    teamLead: true,
                    moderator: true,
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
            if (customClaims && customClaims.teamLead != null) updatedClaims.teamLead = customClaims.teamLead;
            if (customClaims && customClaims.moderator != null) updatedClaims.moderator = customClaims.moderator;
            if (customClaims && customClaims.user != null) updatedClaims.user = customClaims.user;

            // The name is the *primary* role as someone can be admin and moderator for example
            if (updatedClaims.admin) {
                updatedClaims.name = "admin";
            } else if (updatedClaims.teamLead) {
                updatedClaims.name = "teamLead";
            } else if (updatedClaims.moderator) {
                updatedClaims.name = "moderator";
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