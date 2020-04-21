import Util from "../Util/Util";
import UserAuthAPI from "./UserAuthAPI";

// Backend functions for user DB in firestore and auth
class UserDB {
    
    // get al users
    static getUsers = () => {
        return new Promise((resolve, reject) => {
            const dbUsersRef = Util.getBaseDBRefs().dbUsersRef;
            dbUsersRef.orderBy("lastName").get().then((querySnapshot) => {
                let users = [];
                querySnapshot.forEach(doc => {
                    let user = {};
                    user = doc.data();
                    user.displayName = user.displayName ? user.displayName : ""
                    user.firstName = user.firstName ? user.firstName : ""
                    user.lastName = user.lastName ? user.lastName : ""
                    user.phoneNumber = user.phoneNumber ? user.phoneNumber : ""
                    user.id = doc.id;

                    users.push(user);
                });
                // console.log(users);
                return (resolve(users));
            }).catch(err => {
                reject(err);
            });
        });
    }

    // get user base on uid (id and uid are same)
    static get = (id) => {
        // its a promise so return
        return new Promise((resolve, reject) => {
            // then get from firestore
            const dbUsersRef = Util.getBaseDBRefs().dbUsersRef;
            let docRef = dbUsersRef.doc(id);
            docRef.get().then((doc) => {
                if (doc.exists) {
                    let user = doc.data();
                    user.id = doc.id;
                    return(resolve(user));
                }
                console.log("User not found in firestore");
                return(resolve({}));
            }).catch(err => {
                reject(`Error getting user in UserDB ${err}`);
            });
        });
    };

    // get user by email
    static getByEmail = (email) => {
        // its a promise so return
        return new Promise((resolve, reject) => {
            // then get from firestore
            let user = {};
            let foundUser = false;

            const dbUsersRef = Util.getBaseDBRefs().dbUsersRef;
            let docRef = dbUsersRef.where("email", "==", email.toLowerCase()).limit(1);
            docRef.get().then((querySnapshot) => {
                querySnapshot.forEach(doc => {
                    foundUser = true;
                    console.log(doc.data());
                    user = doc.data();
                    user.id = doc.id;
                });

                if (foundUser) {
                    console.log(`User with email: ${email} found!, displayName: ${user.displayName}`);
                    resolve(user);
                } else {
                    user.err = `User with email: ${email} not found in firestore`;
                    console.log(user.err);
                    resolve(user);
                }
            }).catch(err => {
                reject(`Error getting user in UserDB.getByEmail ${err.message}`);
            });
        });
    }    

    // get current user info from auth AND firestore
    static getCurrentUser = () => {
        // its a promise so return
        return new Promise((resolve, reject) => {
            Util.getCurrentAuthUser().then(autUser => {
                const uid = autUser.uid;

                const dbUsersRef = Util.getBaseDBRefs().dbUsersRef;
                // then get from firestore
                let docRef = dbUsersRef.doc(uid);
                docRef.get().then((doc) => {
                    if (doc.exists) {
                        let user = doc.data();
                        resolve(user);
                    } else {
                        console.error("User not found in firestore");
                        resolve();
                    }
                }).catch(err => {
                    reject(`Error getting user in UserDB.getCurrentUser ${err}`);
                });
            }).catch(err => {
                reject(`Error getting user in UserDB.getCurrentUser ${err}`);
            });
        });
    }
    
    
    // delete later - MUST be done on server in secure admin/auth 
    static delete = (uid) => {
        const dbUsersRef = Util.getBaseDBRefs().dbUsersRef;

        return new Promise((resolve, reject) => {
            UserAuthAPI.deleteAuthUser(uid).then(() => {
                console.log("Auth for User successfully deleted!");
                dbUsersRef.doc(uid).delete().then(() => {
                    console.log("Firestore User successfully deleted!");
                    return resolve();
                }).catch((err) => {
                    console.error("Error deleting firestor user ", err);
                    return reject(err);
                });
            }).catch((err) => {
                console.error("Error deleting auth user ", err);
                return reject(err);
            });
        });
    }
    // Updates the current user (not do NOT update uid since it is really a primary key)
    // uid doc field in firestore should only be messed with on create
    static updateCurrent =  (user) => {
        console.log(`trying to update user in fb and auth: ${user}`);
        return new Promise(async (resolve, reject) => {
            const authUser = await Util.getCurrentAuthUser();

            // we always want uid = id to keep auth and firestore in sync
            authUser.updateProfile({
                displayName: `${user.firstName} ${user.lastName}`,
                photoURL: user.photoURL,
            })
            .then(() => {
                console.log("Auth Profile for User successfully updated!");
                const dbUsersRef = Util.getBaseDBRefs().dbUsersRef;
                dbUsersRef.doc(user.id).set({
                    firstName: user.firstName,
                    lastName: user.lastName,
                    displayName: `${user.firstName} ${user.lastName}`,
                    phoneNumber: user.phoneNumber,
                    email: user.email.toLowerCase(),
                    photoURL: user.photoURL ? user.photoURL : "",
                    teamName: user.teamName ? user.teamName : "",
                    teamUid: user.teamUid ? user.teamUid : ""
                },{ merge: true }).then(() => {
                    console.log("completed");
                    resolve();
                }).catch(err => {
                    console.error(`error updating user: ${err}`);
                    reject(err);
                });
            })
            .catch(err => {
                console.log("completed");
                reject(err);
            });
        });
    }

    static update (user) {
        console.log(`trying to update user in fb: ${user}`);
        return new Promise(async (resolve, reject) => {

            // update
            console.log("User updated, user=", user);
            const dbUsersRef = Util.getBaseDBRefs().dbUsersRef;
            dbUsersRef.doc(user.id).set({
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
            const dbUsersRef = Util.getBaseDBRefs().dbUsersRef;
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
    // Switch the challenge the user is in.
    // For now, delete the assigned team since teams are based on challenge
    static updateTeam (userId, teamUid, teamName) {
        console.log(`trying to update team: ${teamUid}, for user ${userId}`);

        return new Promise(async (resolve, reject) => {

            // update
            const dbUsersRef = Util.getBaseDBRefs().dbUsersRef;
            dbUsersRef.doc(userId).set({
                teamUid: teamUid,
                teamName: teamName ? teamName : ""
            }, {
                merge: true
            }).then(() => {
                console.log("completed");
                resolve();
            }).catch(err => {
                console.error(`error updating users team: ${err}`);
                reject(err);
            });
        });

    }

        // Adds a user that has been authroized to the firestore collection
    // If userInfo is passed, add all that, otherwise, just add info from authUser 
    static addAuthUserToFirestore = (authUser, userInfo) => {
        // get first and last name from authUser display name
        let nameArray = []
        if (authUser.user && authUser.user.displayName) {
            nameArray = authUser.user.displayName.split(" ");   
        } 
        let user = {};

        // check if userInfo exists and set accordingly
        // e.g. this function is ploymorphic so it can handle setting lots of userInfo or just seeding the firestore collection
        if (userInfo) {
            user = {
                displayName: `${userInfo.firstName} ${userInfo.lastName}`,
                firstName: userInfo.firstName,
                lastName: userInfo.lastName,
                phoneNumber: userInfo.phoneNumber ? userInfo.phoneNumber : "",
                uid: authUser.user.uid,
                email: userInfo.email.toLowerCase(),
                photoURL: userInfo.photoURL ? userInfo.photoURL : "",
                teamName: userInfo.teamName ? userInfo.teamName : "",
                teamUid: userInfo.teamUid ? userInfo.teamUid : ""
            };
        } else {
            user = {
                displayName: authUser.user.displayName,
                firstName: nameArray.length > 0 ? nameArray[0] : "",
                lastName: nameArray.length > 1 ? nameArray[1] : "",
                phoneNumber: authUser.user.phoneNumber ? authUser.user.phoneNumber : "",
                uid: authUser.user.uid,
                email: authUser.user.email.toLowerCase(),
                photoURL: authUser.user.photoURL ? authUser.user.photoURL : "",
                teamName: user.teamName ? user.teamName : "",
                teamUid: user.teamUid ? user.teamUid : ""
            };
        }

        return new Promise((resolve, reject) => {
            const dbUsersRef = Util.getBaseDBRefs().dbUsersRef;
                    // update if exists, create if not existing
            dbUsersRef.doc(authUser.user.uid).set({
                displayName: user.displayName,
                firstName: user.firstName,
                lastName: user.lastName,
                phoneNumber: user.phoneNumber,
                uid: user.uid,
                email: user.email,
                photoURL: user.photoURL,
                teamName: user.teamName,
                teamUid: user.teamUid

            }).then(() => {
                console.log("Users updated with ID: ", authUser.user.uid);
                resolve(authUser.user.uid);
            }).catch(err => {
                console.error(`error creating user from authUser: ${err}`);
                reject(`error in addAuthUserToFirestore.set creating user from authUser: ${err}`);    
            });
        });
    }



    // Update user's claims / role
    static updateClaims (uid, claims) {
        return new Promise(async (resolve, reject) => {
            // Init claims for primary since you can be multiple
            // update claims
            const dbUsersRef = Util.getBaseDBRefs().dbUsersRef;
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

    // Make user an Admin user - returns a promise 
    static makeAdmin = (uid) => {
        return (UserDB.updateClaims(uid,
            {
                isAdmin: true,
                isModerator: false,
                isteamLead: false,
                isUser: false,
                primaryRole: "admin"
            }
        ));
    }

    // Make user an Admin user - returns a promise 
    static makeModerator = (uid) => {
        return (UserDB.updateClaims(uid,
            {
                isAdmin: false,
                isModerator: true,
                isteamLead: false,
                isUser: false,
                primaryRole: "moderator"
            }
        ));
    }
    
    // Make user a teamLead - returns a promise 
    static makeTeamLead = (uid) => {
        return (UserDB.updateClaims(uid,
            {
                isAdmin: false,
                isModerator: false,
                isteamLead: true,
                isUser: false,
                primaryRole: "teamLead"
            }
        ));
    }

    // Make user a plain ole user - essential disables admin or teamLead or other functionality 
    static makeUser = (uid) => {
        return (UserDB.updateClaims(uid,
            {
                isAdmin: false,
                isModerator: false,
                isteamLead: false,
                isUser: false,
                primaryRole: "user"
            }
        ));
    }    
}

export default UserDB;