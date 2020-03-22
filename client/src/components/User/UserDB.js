import Util from "../Util/Util";

// Backend functions for user DB in firestore and auth
class UserDB {
    static updateClaims (uid, claims) {
        
        /* Use this after you get thje claims of users DB
        if (user.isAdmin) {
            user.primaryRole = "admin"
        } else if (user.isTeamLead) {
            user.primaryRole = "teamLead"
        } else if (user.isModerator) {
            user.primaryRole = "moderator"
        } else {
            user.primaryRole = "athlete"
            user.isUser  = true;
        }
        */

        return new Promise(async (resolve, reject) => {
            // Init claims for primary since you can be multiple
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

            // update
            console.log("User updated, user=", user);
            const dbUsersRef = Util.getDBRefs().dbUsersRef;
            dbUsersRef.doc(user.uid).set({
                firstName: user.firstName,
                lastName: user.lastName,
                displayName: `${user.firstName} ${user.lastName}`,
                phoneNumber: user.phoneNumber,
                email: user.email,
                photoURL: user.photoURL ? user.photoURL : "",
                teamUid: user.teamUid ? user.teamUid  : "",
                teamName: user.teamName ? user.teamName  : ""
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

    // Switch the challenge the user is in.
    // For now, delete the assigned team since teams are based on challenge
    static updateChallenge (userId, challengeUid) {
        console.log(`trying to update challenge; ${challengeUid}, for user ${userId}`);

        return new Promise(async (resolve, reject) => {

            // update
            const dbUsersRef = Util.getDBRefs().dbUsersRef;
            dbUsersRef.doc(userId).set({
                challengeUid: challengeUid ? challengeUid  : "",
                teamUid: null,
                teamName: ""
            }, {
                merge: true
            }).then(() => {
                console.log("completed");
                resolve();
            }).catch(err => {
                console.error(`error updating users challengeUid: ${err}`);
                reject(err);
            });
        });

    }
}

export default UserDB;