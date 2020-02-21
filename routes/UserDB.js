"use strict";
const admin = require("../middleware/authServerCommon");
const GLOBAL_ENV = "../ServerEnvironment";

// Backend functions for user DB in firestore and auth
class UserDB {
    static updateClaims (uid, claims, authClaims) {
        return new Promise(async (resolve, reject) => {
            const db = admin.firestore();
            // Init claims for primary since you can be multiple
            let updateFields = {claims: claims};

            // Only *set* claims passed
            if (authClaims && authClaims.admin != null) updateFields.isAdmin = authClaims.admin;
            if (authClaims && authClaims.cashier != null) updateFields.isCashier = authClaims.cashier;
            if (authClaims && authClaims.banker != null) updateFields.isBanker = authClaims.banker;
            if (authClaims && authClaims.user != null) updateFields.isUser = authClaims.user;

            // update claims
            const dbUserRef = db.collection(`${GLOBAL_ENV.ORG}`).doc(`${GLOBAL_ENV.ENV}`).collection(`${GLOBAL_ENV.USERS_DB}`)
            dbUserRef.doc(uid).set(updateFields,
                { merge: true }
            ).then(() => {
                resolve();
            }).catch(err => {
                console.error(`Error updating claims in UserDB: ${err}`);
                reject(err);
            });
        });
    }

    static update (user) {
        console.log(`trying to update user in fb: ${user}`);
        return new Promise(async (resolve, reject) => {
            const db = admin.firestore();;

            // update
            console.log("User updated, user=", user);
            const dbUserRef = db.collection(`${GLOBAL_ENV.ORG}`).doc(`${GLOBAL_ENV.ENV}`).collection(`${GLOBAL_ENV.USERS_DB}`)
            dbUserRef.doc(user.uid).set({
                firstName: user.firstName,
                lastName: user.lastName,
                displayName: `${user.firstName} ${user.lastName}`,
                phoneNumber: user.phoneNumber,
                email: user.email,
                photoURL: user.photoURL ? user.photoURL : ""
            }, {
                merge: true
            }).then(() => {
                console.log("completed");
                resolve();
            }).catch(err => {
                console.error(`error updating user: ${err}`);
                reject(err);
            });
        });
    }
}

module.exports = UserDB;