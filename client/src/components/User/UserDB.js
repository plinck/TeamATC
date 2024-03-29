import Util from "../Util/Util";
import UserAuthAPI from "./UserAuthAPI";
// import { UserChallenge, User } from "../../interfaces/User";

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
                    user.challenges = user.challenges ? user.challenges : [];
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
                    user.challenges = user.challenges ? user.challenges : [];
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
                    user.challenges = user.challenges ? user.challenges : [];
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
                        user.challenges = user.challenges ? user.challenges : [];
                        user.id = doc.id;
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
    // Updates the current user (do NOT update uid since it is really a primary key)
    // uid doc field in firestore should only be messed with on create
    static updateCurrent =  (user) => {
        console.log(`trying to update user in fb and auth: ${user}`);
        // make a copy --i.e. not a reference
        let newUser = {...user};
        // Delete the id field since you do not want in db as it is they key
        try {
            delete newUser.id
        } catch {
            // no op - dont care
        }
        newUser.displayName = newUser.firstName + " " + newUser.lastName;

        return new Promise(async (resolve, reject) => {
            const authUser = await Util.getCurrentAuthUser();
            // we always want uid = id to keep auth and firestore in sync
            const profileUpdate = {displayName: newUser.displayName};
            if (newUser.photoObj && newUser.photoObj.url && newUser.photoObj.url !== "") {
                profileUpdate.photoURL = newUser.photoObj.url;
            }
            authUser.updateProfile(profileUpdate).then(() => {
                console.log("Auth Profile for User successfully updated!");
                const dbUsersRef = Util.getBaseDBRefs().dbUsersRef;
                dbUsersRef.doc(user.id).set(newUser, { merge: true }).then(() => {
                    console.log("completed");
                    resolve();
                }).catch(err => {
                    console.error(`error updating user: ${err}`);
                    reject(err);
                });
            }).catch(err => {
                console.log("completed");
                reject(err);
            });
        });
    }

    static update (user) {
        console.log(`trying to update user in fb: ${user}`);
        let newUser = {...user};
        // Delete the id field since you do not want in db as it is they key
        try {
            delete newUser.id
        } catch {
            // no op - dont care
        }
        newUser.displayName = newUser.firstName + " " + newUser.lastName;

        return new Promise(async (resolve, reject) => {
            // update
            console.log("User updated, newUser=", newUser);
            const dbUsersRef = Util.getBaseDBRefs().dbUsersRef;
            dbUsersRef.doc(user.id).set(newUser, {
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
    static updateChallenge (user, teams, challengeUid) {
        console.log(`trying to update challenge; ${challengeUid}, for user ${user.id}`);

        return new Promise(async (resolve, reject) => {
        
            // first get challengese a user is in
            let idx = -1;
            if (user.challenges) {
                idx = user.challenges.findIndex((userChallenge) => {
                    const foundIdx = userChallenge.challengeUid === challengeUid;
                    return foundIdx;
                });
            } else {
                user.challenges = [];
            }
    
            let teamUid = "";
            let teamName = "";
            if (idx > -1) {       // Found
                teamUid = user.challenges[idx].teamUid;
                teamName = teams.find(team => {
                    if ( team.teamUid && team.teamUid === teamUid ) {
                        return team.teamName;
                    }
                    return null;
                });
            } else {
                teamUid = "";
                teamName = "";
                user.challenges.push({challengeUid: challengeUid, teamUid: teamUid});
            }
    
            // update
            const dbUsersRef = Util.getBaseDBRefs().dbUsersRef;
            dbUsersRef.doc(user.id).set({
                challenges: user.challenges,
                challengeUid: challengeUid ? challengeUid  : "",
                teamUid: teamUid ? teamUid : "",
                teamName: teamName ? teamName : ""
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
    static updateTeam (user, teamUid, teamName) {
        console.log(`trying to update team: ${teamUid}, for user ${user.id}`);

        return new Promise(async (resolve, reject) => {
            // first get challengese a user is in
            let idx = -1;
            if (user.challenges) {
                idx = user.challenges.findIndex((userChallenge) => {
                    const foundIdx = userChallenge.challengeUid === user.challengeUid;
                    return foundIdx;
                });
            } else {
                user.challenges = [];
            }
    
            if (idx > -1) {       // Found
                user.challenges[idx].teamUid = teamUid;
            } else {
                user.challenges.push({challengeUid: user.challengeUid, teamUid: teamUid});
            }

            // update
            const dbUsersRef = Util.getBaseDBRefs().dbUsersRef;
            dbUsersRef.doc(user.id).set({
                challenges: user.challenges,
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
                challenges: userInfo.challenges ? userInfo.challenges : [],
                challengeUid: userInfo.challengeUid ? userInfo.challengeUid : "",
                displayName: `${userInfo.firstName} ${userInfo.lastName}`,
                email: userInfo.email.toLowerCase(),
                firstName: userInfo.firstName,
                isAdmin: userInfo.isAdmin ? true : false,
                isModerator: userInfo.isModerator ? true : false,
                isTeamLead: userInfo.isTeamLead ? true : false,
                isUser: userInfo.isUser ? true : false,
                lastName: userInfo.lastName,
                phoneNumber: userInfo.phoneNumber ? userInfo.phoneNumber : "",    
                photoObj: userInfo.photoObj ? userInfo.photoObj : {fileName: "", fileTitle: "", url: ""},
                primaryRole: userInfo.primaryRole ? userInfo.primaryRole : "User",
                stravaAccessToken: userInfo.stravaAccessToken ? userInfo.stravaAccessToken : "",
                stravaAthleteId : userInfo.stravaAthleteId ? userInfo.stravaAthleteId : "",
                stravaExpiresAt: userInfo.stravaExpiresAt ? userInfo.stravaExpiresAt : null,
                stravaRefreshToken: userInfo.stravaRefreshToken ? userInfo.stravaRefreshToken : "",
                stravaUserAuth : userInfo.stravaUserAuth ? userInfo.stravaUserAuth : false,    
                teamName: userInfo.teamName ? userInfo.teamName : "",
                teamUid: userInfo.teamUid ? userInfo.teamUid : "",
                uid: authUser.user.uid,
            };
        } else {
            user = {
                displayName: authUser.user.displayName,
                firstName: nameArray.length > 0 ? nameArray[0] : "",
                lastName: nameArray.length > 1 ? nameArray[1] : "",
                phoneNumber: authUser.user.phoneNumber ? authUser.user.phoneNumber : "",
                uid: authUser.user.uid,
                email: authUser.user.email.toLowerCase(),
                teamName: user.teamName ? user.teamName : "",
                teamUid: user.teamUid ? user.teamUid : ""
            };
        }

        return new Promise((resolve, reject) => {
            const dbUsersRef = Util.getBaseDBRefs().dbUsersRef;
                    // update if exists, create if not existing
            dbUsersRef.doc(authUser.user.uid).set(user, {merge: true} ).then(() => {
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
                isTeamLead: false,
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
                isTeamLead: false,
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
                isTeamLead: true,
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
                isTeamLead: false,
                isUser: true,
                primaryRole: "user"
            }
        ));
    }    
}

export default UserDB;