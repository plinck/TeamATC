"use strict";
const admin = require("../middleware/authServerCommon");
const Util = require("./Util.js");

// Backend functions for user DB in firestore and auth
class UserDB {
    static updateClaims (uid, claims) {
        return new Promise(async (resolve, reject) => {
            // update claims
            const dbUsersRef = Util.getDBRefs().dbUsersRef;
            dbUsersRef.doc(uid).set(claims,
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
            const dbUsersRef = Util.getDBRefs().dbUsersRef;
            dbUsersRef.doc(user.uid).set({
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