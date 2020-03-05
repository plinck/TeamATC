import Util from "../Util/Util";
import UserDB from "./UserDB";

class UserAPI {
    // geths the current auth user info from firestore auth service
    static getCurrentAuthUser = () => {
        // its a promise so return
        return new Promise((resolve, reject) => {
            resolve(Util.getCurrentAuthUser());
        });
    }

    // get current user info from auth AND firestore
    static getCurrentUser = () => {
        // its a promise so return
        return new Promise((resolve, reject) => {
            Util.getCurrentAuthUser().then(autUser => {
                const uid = autUser.uid;

                const dbUsersRef = Util.getDBRefs().dbUsersRef;
                // then get from firestore
                let docRef = dbUsersRef.doc(uid);
                docRef.get().then((doc) => {
                    if (doc.exists) {
                        // update
                        let user = doc.data();
                        resolve(user);
                    } else {
                        console.error("User not found in firestore");
                        resolve();
                    }
                }).catch(err => {
                    reject(`Error getting user in UserAPI.getCurrentUser ${err}`);
                });
            }).catch(err => {
                reject(`Error getting user in UserAPI.getCurrentUser ${err}`);
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
                const dbUsersRef = Util.getDBRefs().dbUsersRef;
                // update
                dbUsersRef.doc(user.id).set({
                    firstName: user.firstName,
                    lastName: user.lastName,
                    displayName: `${user.firstName} ${user.lastName}`,
                    phoneNumber: user.phoneNumber,
                    email: user.email.toLowerCase(),
                    photoURL: user.photoURL ? user.photoURL : "",
                    teamName: user.teamName,
                    teamUid: user.teamUid
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

    // This calls the backend to allow admins to create an auth user securely abd not change login
    static createAuthUser = (authUser) => {
        return(Util.apiPost("/api/auth/createUser", authUser));
    }

    // This calls the backend to allow admins to create an auth user securely abd not change login
    static createNoTokenUser = (authUser) => {
        return(Util.apiPostNoToken("/api/auth/createNoTokenUser", authUser));
    }

    // This calls the backend to allow admins to create an auth user securely abd not change login
    static registerNewUser = (user) => {
        console.log(`trying to update user in auth: ${user}`);
        const firebase = Util.getFirebaseAuth();

        return(firebase.doCreateUserWithEmailAndPassword(user.email, user.password));
    }    

    // Update user's auth profile
    static updateCurrentUserAuthProfile(user) {
        // HERE
        let promise = 
            this.getCurrentAuthUser().then (authUser => {
                authUser.updateProfile({
                    displayName: `${user.firstName} ${user.lastName}`,
                    photoURL: user.photoURL ? user.photoURL : "",
                    phoneNumber: user.phoneNumber ? user.phoneNumber : ""
                }).then(() => {
                    // Update successful - doesnt matter
                }).catch((error) => {
                    // An error happened - doesnt matter, just log
                    console.error(`Error updateing user's profile ${error}.  No biigie, user still OK`);
                });
            }).catch (err => {
                // no biggie, let go
            });

        return promise;
    }

    // This calls the backend to allow admins to create an auth user securely abd not change login
    static signinNewUser = (user) => {
        console.log(`trying to sign user in auth: ${user}`);
        const firebase = Util.getFirebaseAuth();

        return(firebase.doSignInWithEmailAndPassword(user.email, user.password));
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
            const dbUsersRef = Util.getDBRefs().dbUsersRef;
            let docRef = dbUsersRef.doc(authUser.user.uid);
            docRef.get().then((doc) => {
                if (doc.exists) {
                    // update
                    dbUsersRef.doc(authUser.user.uid).update({
                        displayName: user.displayName,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        phoneNumber: user.phoneNumber,
                        uid: user.uid,
                        email: user.email,
                        photoURL: user.photoURL,
                        teamName: user.teamName,
                        teamUid: user.teamUid    
                    },{ merge: true }).then((doc) => {
                        console.log("Document updated with ID: ", doc.id);
                        resolve(doc.id);
                    }).catch(err => {
                        console.error(`Error creating user from authUser: ${err}`);
                        reject(`Error in addAuthUserToFirestore.update creating user from authUser: ${err}`);    
                    });
                } else {
                    // cretae if not existing
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
                        console.log("Document added with ID: ", authUser.user.uid);
                        resolve(authUser.user.uid);
                    }).catch(err => {
                        console.error(`error creating user from authUser: ${err}`);
                        reject(`error in addAuthUserToFirestore.add creating user from authUser: ${err}`);    
                    });
                }
            }).catch(err => {
                console.error(`error creating user from authUser: ${err}`);
                reject(`error in addAuthUserToFirestore.docRef.get creating user from authUser: ${err}`);
            });
        });
    }

    // Everything from top down must be async or awaits do NOT wait
    static getUsers = () => {
        return new Promise((resolve, reject) => {
            const dbUsersRef = Util.getDBRefs().dbUsersRef;
            dbUsersRef.get().then((querySnapshot) => {
                let users = [];
                querySnapshot.forEach(doc => {
                    let user = {};
                    user = doc.data();
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

    // get user by email
    static getByEmail = (email) => {
        // its a promise so return
        return new Promise((resolve, reject) => {
            // then get from firestore
            let user = {};
            let foundUser = false;

            const dbUsersRef = Util.getDBRefs().dbUsersRef;
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
                reject(`Error getting user in UserAPI.getByEmail ${err.message}`);
            });
        });
    }

    // get user base on uid (id and uid are same)
    static get = (id) => {
        // its a promise so return
        return new Promise((resolve, reject) => {
            // then get from firestore
            const dbUsersRef = Util.getDBRefs().dbUsersRef;
            let docRef = dbUsersRef.doc(id);
            docRef.get().then((doc) => {
                if (doc.exists) {
                    // update
                    let user = doc.data();
                    return(resolve(user));
                }
                console.log("User not found in firestore");
                return(resolve({}));
            }).catch(err => {
                reject(`Error getting user in UserAPI ${err}`);
            });
        });
    };

    // delete later - MUST be done on server in secure admin/auth 
    static delete = (uid) => {
        const dbUsersRef = Util.getDBRefs().dbUsersRef;

        return new Promise((resolve, reject) => {
            Util.apiPost(`/api/auth/deleteUser/${uid}`, {
                    id: uid
                }).then(() => {
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

    // Update Existing user
    // NOTE: - I purposely do not update uid since that is essentially the primary key
    static update =  (user) => {
        const dbUsersRef = Util.getDBRefs().dbUsersRef;

        console.log(`trying to update user in firestore: ${user}`);
        return new Promise(async (resolve, reject) => {

            // we always want uid = id to keep auth and firestore in sync
            // Do NOT update isAdmin, isTeamLead etc.  or primaryRole i- only change primaryRole through auth
            // (unless using just user or noAuth since those are not *secure*)
            dbUsersRef.doc(user.id).set({
                firstName: user.firstName,
                lastName: user.lastName,
                displayName: `${user.firstName} ${user.lastName}`,
                phoneNumber: user.phoneNumber,
                email: user.email.toLowerCase(),
                photoURL: user.photoURL ? user.photoURL : "",
                teamUid: user.teamUid ? user.teamUid  : "",
                teamName: user.teamName ? user.teamName  : ""
            },{ merge: true }).then(() => {
                resolve();
            }).catch(err => {
                console.error(`error updating user: ${err}`);
                reject(err);
            });
        });
    }

    // Make user an Admin user - returns a promise 
    static makeAdmin = (uid) => {
        return (UserDB.updateClaims(uid, {isAdmin: true, primaryRole: "admin"}));
    }

    // Make user an Admin user - returns a promise 
    static makeModerator = (uid) => {
        return (UserDB.updateClaims(uid, {isModerator: true}));
    }
    
    // Make user a teamLead - returns a promise 
    static makeTeamLead = (uid) => {
        return (UserDB.updateClaims(uid, {isteamLead: true}));
    }

    // Make user a plain ole user - essential disables admin or teamLead or other functionality 
    static makeUser = (uid) => {
        return (UserDB.updateClaims(uid,
            {
                istAdmin: false,
                isModerator: false,
                isteamLead: false,
                isUser: false,
                primaryRole: "user"
            }
        ));
    }    
    
}

export default UserAPI;