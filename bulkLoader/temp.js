"use strict";
const inquirer = require("inquirer");
let fs = require('fs');
require("dotenv").config();

const admin = require("./authServerCommon");

let dbALLRefs = {};

const Util = require("./Util.js");
const MemberInfo = require("./MemberInfo.js");
const Activities = require("./Activities.js");

function exitProgram() {
    console.log("BYE!");
}

    // Add a single activity based on id
function createActivity (activity) {
    const dbActivitiesRef = dbALLRefs.dbActivitiesRef;

    // first check if activiy already exist with this info
    return new Promise((resolve, reject) => {
        dbActivitiesRef
        .where("email", "==", activity.email)
        .where("activityDateTime", "==", activity.activityDateTime)
        .where("distance", "==", activity.distance)
        .where("activityType", "==", activity.activityType)
        .get()
        .then(snapShot => {
            let foundActivity = false;
            snapShot.forEach(function (doc) {
                foundActivity = true;
                console.log(doc.id, ' => ', doc.data());
            });
            if (!foundActivity) {
                dbActivitiesRef.add({
                    activityDateTime: activity.activityDateTime,
                    activityName: activity.activityName,
                    activityType: activity.activityType,
                    displayName: activity.displayName,
                    distance: activity.distance,
                    distanceUnits: activity.distanceUnits,
                    duration: activity.duration ? activity.duration : 0,
                    email: activity.email,
                    teamName: activity.teamName,
                    teamUid: activity.teamUid
                        ? activity.teamUid
                        : null,
                    uid: activity.uid
                }).then((res) => {
                    // console.log("Firestore activity successfully added");
                    resolve(res);
                }).catch((error) => {
                    console.error("Firestore activity add failed");
                    reject(error);
                });    
            } else {
                resolve(activity);
            }
        }).catch((error) => {
            console.error("Activity not found which is OK, as I will add");
            dbActivitiesRef.add({
                activityDateTime: activity.activityDateTime,
                activityName: activity.activityName,
                activityType: activity.activityType,
                displayName: activity.displayName,
                distance: activity.distance,
                distanceUnits: activity.distanceUnits,
                duration: activity.duration ? activity.duration : 0,
                email: activity.email,
                teamName: activity.teamName,
                teamUid: activity.teamUid
                    ? activity.teamUid
                    : null,
                uid: activity.uid
            }).then((res) => {
                // console.log("Firestore activity successfully added");
                resolve(res);
            }).catch((error) => {
                console.error("Firestore activity add failed");
                reject(error);
            });
        });
    });
}


// Assume users create and up
async function createActivitiesFromGoogleDoc(fileToUpload) {
    const dbUsersRef = dbALLRefs.dbUsersRef;

    let ChallengeActivities = [];
    let totalActivitiesAdded = 0;
    let ATCMembers = await MemberInfo.getMembers();
    let teams = await MemberInfo.getTeams();

    if (!fileToUpload) {
        fileToUpload = "ATCActivities.csv";
    }
    console.log(`Uploading Activities from ${fileToUpload}`);
    // read  the file and parse
    if (fileToUpload) {
        fs.readFile(fileToUpload, 'utf8', (err, data) => {
                //
                if (err) throw err;
                console.log(`OK reading file`);
 
                //remove the quotes
                let fixedData = data.replace(/["]*/g, "");
                //console.log(`read ${fixedData} from file: ${fileToUpload}`);
                let lines = fixedData.split('\n');
                console.log(`read ${lines.length} lines of data from file: ${fileToUpload} line[0].length: ${lines[0].length}`);

                ChallengeActivities = Activities.getChallengeActivities (lines, ATCMembers, teams);      

                // Now, I need to create the activities
                for (let i = 0; i < ChallengeActivities.length; i++) {
                    if (true) {
                        let activity = ChallengeActivities[i];
                        // no name in google doc so make up one
                        activity.activityName = activity.activityType;
                        let foundUser = false;
                        let user = {};
                        // need to get uid from user based on email
                        let docRef = dbUsersRef.where("email", "==", activity.email.toLowerCase()).limit(1);
                        docRef.get().then((querySnapshot) => {
                            querySnapshot.forEach(doc => {
                                foundUser = true;
                                user = doc.data();
                                user.id = doc.id;
                            });
            
                            if (foundUser) {
                                //(`User with email: ${user.email} found!, displayName: ${user.displayName}`);
                                activity.uid = user.id;
                                createActivity(activity).then(res => {
                                    // worked
                                    // console.log(`Created Activity in createActivitiesFromGoogleDoc: ${res}`);
                                    totalActivitiesAdded += 1;
                                }).catch(err => {
                                    console.error(`Error Creating Activity in createActivitiesFromGoogleDoc: ${activity}`);
                                });                  
        
                            } else {
                                user.err = `User with email: ${activity.email} not found in firestore`;
                                console.error(user.err);
                            }
                        }).catch(err => {
                            console.error(`Error getting user ${err.message}`);
                        });
                    }
                }
        }); //fs.read
        console.log(`Total Activities Created: ${totalActivitiesAdded}`)
    } else {
    }
}
// Copy Users from current location to DEV
async function createUsersFromGoogleActivities(fileToUpload) {
    const dbTeamsRef = dbALLRefs.dbTeamsRef
    const dbATCMembersRef = dbALLRefs.dbATCMembersRef
    
    // First Read and Parse All from ATC CSV file to grab participating users
    if (!fileToUpload) {
        fileToUpload = "ATCActivities.csv";
    }
    console.log(`Matching Challenge Users to Members and then users from ${fileToUpload}`);

    let ChallengeMembersAlreadyExists = [];
    let ChallengeMembers = [];
    let ChallengeActivities = [];
        
    let ATCMembers = await MemberInfo.getMembers();
    let teams = await MemberInfo.getTeams();

    // read  the file and parse
    if (fileToUpload) {
        fs.readFile(fileToUpload, 'utf8', (err, data) => {
            //
            if (err) throw err;
            console.log(`OK reading file`);

            let totalMembers = 0;

            //remove the quotes
            let fixedData = data.replace(/["]*/g, "");
            //console.log(`read ${fixedData} from file: ${fileToUpload}`);
            let lines = fixedData.split('\n');
            console.log(`read ${lines.length} lines of data from file: ${fileToUpload} line[0].length: ${lines[0].length}`);
            // 1/15/2020 10:00:53,Laurie Nicholson,1/15/2020,Run,3.4,Rahuligan,Miles (Bike and Run)

            ChallengeActivities = Activities.getChallengeActivities (lines, ATCMembers, teams);      

            for (let i = 0; i < ChallengeActivities.length; i++) {
                if (!ChallengeActivities[i]) {
                    console.log(`Bad activity at index: ${i}`);
                    continue;
                }
                if (ChallengeMembersAlreadyExists[ChallengeActivities[i].displayName]) {
                    continue;
                } else {
                    
                ChallengeMembersAlreadyExists[ChallengeActivities[i].displayName] = true;
                let member = {
                    displayName: ChallengeActivities[i].displayName,
                    distanceUnits: ChallengeActivities[i].distanceUnits,
                    firstName: ChallengeActivities[i].firstName,
                    lastName: ChallengeActivities[i].lastName,

                    email:ChallengeActivities[i].email.toLowerCase(),
                    phoneNumber: "",
                    photoURL: "",
                    teamUid: ChallengeActivities[i].teamUid,
                    teamName: ChallengeActivities[i].teamName,
                }

                ChallengeMembers.push(member);
                totalMembers += 1;

                    //console.log(`Unique Member: ${JSON.stringify(member)}`);
                }
            }
            console.log(`Challenge Members: ${totalMembers}`)

            // Now, I need to creeate the users and then add the acivities
            for (let i = 0; i < ChallengeMembers.length; i++) {
                if (true) {
                    let user = ChallengeMembers[i];
                    let authUser = {};
                    user.password = undefined;
                    admin.auth().getUserByEmail(user.email).then((authUser) => {
                        // User found.
                        // console.log(`Found authUser: ${JSON.stringify(authUser, null, 4)}`);
                        user.uid = authUser.uid;
                        createFirestoreUserBootstrap(user).then (newUser => {
                            // console.log(`Creating User in createFirestoreUserBootstrap: ${user}, newUser: ${newUser}`);
                        }).catch(err => {
                            console.error(`Error Creating User in createFirestoreUserBootstrap: ${user}`);
                        });  

                    }).catch(function(error) {
                        //console.log("Error fetching auth user data:", error);
                        createAuthUserBootstrap(user).then(authUser => {
                            //console.log(`Created authUser: ${JSON.stringify(authUser, null, 4)}`);
                            user.uid = authUser.uid;
                            createFirestoreUserBootstrap(user).then (newUser => {
                                // Now update claims for a user - I dont think I acutaull need to do this
                                // setAuthClaimsAsUser(authUser.uid, newClaims).then ( () => {
                                //     // claims successful
                                //     console.log(`Successfully Creating User in setAuthClaimsAsUser: ${user}`);
                                // }).catch(err => {
                                //     console.error(`Error Creating User in setAuthClaimsAsUser: ${user}`);
                                // });                
                            }).catch(err => {
                                console.error(`Error Creating User in createFirestoreUserBootstrap: ${user}`);
                            });  
                        });                                 
                    }).catch(err => {
                        if (err.code == "auth/email-already-exists") {
                            // its OK if already exists sine I just created it
                            console.error(`Auth User already exists ${err}`);                                    
                        } else {
                            console.error(`Error Creating User in createAuthUserBootstrap: ${err}`);
                        }
                    });
                } // if true
            } // loop challenge members
        }); //fs.read
    } else {
    }
}


// Copy Users from current location to DEV
async function copyUsersToDev() {
    const dbUsersRef = dbALLRefs.dbUsersRef;

    console.log(`Copying users from ${dbCollSource} to ${dbCollDest}`);

        return new Promise((resolve, reject) => {
            dbUsersRef
                .get()
                .then(querySnapshot => {
                    let users = [];
                    querySnapshot.forEach(doc => {
                        let user = {};
                        user = doc.data();
                        user.id = doc.id;
                        users.push(user);

                        // Now create the user with same ID
                        // console.log(`User retrieved, user=${JSON.stringify(user)}`);
                        dbUsersRef
                            .doc(user.id)
                            .set(user)
                            .then(user => {
                                //console.log(`Updated user ${JSON.stringify(user)}`);
                                resolve(user);
                            })
                            .catch(err => {
                                console.error(`error updating user: ${err}`);
                                reject(err);
                            });
                    });
                });
            return resolve();
        }).catch(err => {
            reject(err);
        });
}

async function deleteATCMembers() {
    const dbATCMembersRef = dbALLRefs.dbATCMembersRef

    dbATCMembersRef.listDocuments().then(val => {
        val.map((val) => {
            val.delete()
        })
    })

}

// Copy Users from current location to DEV
async function uploadATCMembers(fileToUpload) {
    const dbATCMembersRef = dbALLRefs.dbATCMembersRef

    if (!fileToUpload) {
        fileToUpload = "ATCMembers.csv";
    }
    console.log(`Uploading ATC users from ${fileToUpload}`);

    // read  the file and parse
    let ATCMembers = [];

    if (fileToUpload) {
        fs.readFile(fileToUpload, 'utf8', (err, data) => {
            if (err) throw err;
            console.log(`OK reading file`);

            //remove the quotes
            let fixedData = data.replace(/["]*/g, "");
            let lines = fixedData.split('\n');

            ATCMembers = lines.map((line) => {
                let memberArray = line.split(',');
                let lastName = memberArray[0].trim().toLowerCase();
                let firstName = memberArray[1].trim().toLowerCase();
                let email = memberArray[2].trim().toLowerCase();

                lastName = lastName.charAt(0).toUpperCase() + lastName.slice(1)
                firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1)

                let member = {
                    lastName: lastName,
                    firstName: firstName,
                    email: email
                };
                //console.log(`Member: ${JSON.stringify(member)}`); 
                return (member);
            });

            let _ = ATCMembers.map((member) => {
                // console.log(`Trying to update ${JSON.stringify(member)}`);
                // use email address as key to overwrite duplicates
                dbATCMembersRef
                    .doc(member.email)
                    .set(member)
                    .then(memberId => {
                        //console.log(`Updated member ${JSON.stringify(member)} with id: ${memberId}`);
                    })
                    .catch(err => {
                        console.error(`error updating user: ${err}`);
                    });
            });
        }); // MAP
    } else {
    }
}


// update claims from auth into FB
function updateClaimsInFirestore(uid, claims, authClaims) {
    const dbUsersRef = dbALLRefs.dbUsersRef;

    return new Promise(async (resolve, reject) => {

        // Init claims for primary since you can be multiple
        let updateFields = {
            claims: claims
        };

        // Only *set* claims passed
        if (authClaims && authClaims.admin != null)
            updateFields.isAdmin = authClaims.admin;
        if (authClaims && authClaims.teamLead != null)
            updateFields.isTeamLead = authClaims.teamLead;
        if (authClaims && authClaims.moderator != null)
            updateFields.isModerator = authClaims.moderator;
        if (authClaims && authClaims.user != null)
            updateFields.isUser = authClaims.user;

        // update claims
        dbUsersRef
            .doc(uid)
            .set(updateFields, {
                merge: true
            })
            .then(() => {
                resolve();
            })
            .catch(err => {
                console.error(`Error updating claims ${err}`);
                reject(err);
            });
    });
}

// Set csutom claim without overrding other claim
function setAuthClaims(uid, customClaims) {
    return new Promise(async (resolve, reject) => {
        // The name is the *primary* role as someone can be admin and moderator for example
        if (customClaims.admin) {
            customClaims.name = "admin";
        } else if (customClaims.teamLead) {
            customClaims.name = "teamLead";
        } else if (customClaims.moderator) {
            customClaims.name = "moderator";
        } else if (customClaims.user) {
            customClaims.name = "user";
        } else {
            v.name = "noclaims";
        }

        admin
            .auth()
            .setCustomUserClaims(uid, customClaims)
            .then(() => {
                resolve(customClaims);
            })
            .catch(err => {
                console.error("Error updating claims in AuthUserAPI", err);
                resolve(customClaims);
            });
    }); // promise
}

async function setAuthAndFBClaims(uid) {
    return new Promise(async (resolve, reject) => {
        // Now, set custom claims
        setAuthClaims(uid, {
                admin: true,
                teamLead: true,
                moderator: true,
                user: true
            })
            .then(async newClaims => {
                await updateClaimsInFirestore(uid, newClaims.name, newClaims);
                resolve();
            })
            .catch(err => {
                // catch all error
                console.error(
                    `Error caught in route app.post("/api/auth/setTeamLead..." ${err}`
                );
                reject(err);
            });
    });
}
async function setAuthClaimsAsUser(uid) {
    return new Promise(async (resolve, reject) => {
        // Now, set custom claims
        setAuthClaims(uid, {
                admin: false,
                teamLead: false,
                moderator: false,
                user: true
            })
            .then(async newClaims => {
                await updateClaimsInFirestore(uid, newClaims.name, newClaims);
                resolve();
            })
            .catch(err => {
                // catch all error
                console.error(
                    `Error caught in route app.post("/api/auth/setTeamLead..." ${err}`
                );
                reject(err);
            });
    });
}

async function createFirestoreUserBootstrap(user) {
    const dbUsersRef = dbALLRefs.dbUsersRef;

    //console.log(`trying to update user in fb: ${user}`);
    return new Promise(async (resolve, reject) => {
        // update
        // console.log("User updated, user=", user);
        dbUsersRef.doc(user.uid)
            .set({
                firstName: user.firstName,
                lastName: user.lastName,
                displayName: `${user.firstName} ${user.lastName}`,
                phoneNumber: user.phoneNumber,
                email: user.email.toLowerCase(),
                photoURL: user.photoURL ? user.photoURL : "",
                teamUid: user.teamUid ? user.teamUid : "",
                teamName: user.teamName ? user.teamName : ""
            }, {
                merge: true
            })
            .then(user => {
                //console.log(`Updated user to: ${JSON.stringify(user)}`);
                resolve(user);
            })
            .catch(err => {
                console.error(`error updating user: ${err}`);
                reject(err);
            });
    });
}

// Route for Creating a new user with email and password
function createAuthUserBootstrap(user) {
    // console.log(`trying to createAuthUserBootstrap: ${JSON.stringify(user, null, 2)}`);
    // Generate random password if no password exists (meaning its created by someone else)
    if (!user.password || user.password === null || user.password === "") {
        let randomPassword = Math.random().toString(36).slice(-8);
        user.password = randomPassword;
    }
    
    return new Promise(async (resolve, reject) => {
        // Create auth user
        admin.auth().createUser({
                email: user.email,
                emailVerified: true,
                password: user.password,
                displayName: `${user.firstName} ${user.lastName}`,
                disabled: false
            }).then(authUser => {
                // console.log("Successfully added auth user");
                resolve(authUser);
            }).catch(err => {
                console.error("Error creating auth user:", err);
                reject(err);
            });
    });
}

async function seedDatabase() {
    let user = {
        uid: null,
        email: "paull@linck.net",
        password: "123456",
        firstName: "Paul",
        lastName: "LinckNET",
        phoneNumber: "404-687-1115",
        photoURL: "",
        disabled: false
    };

    const question = [{
            name: "email",
            message: "\nEmail Address?",
            validate: value => value !== ""
        },
        {
            name: "password",
            message: "Pssword?",
            validate: value => value !== "" && value.length >= 6
        },
        {
            name: "firstName",
            message: "\nFirst Name?",
            validate: value => value !== ""
        },
        {
            name: "lastName",
            message: "Last Name?",
            validate: value => value !== ""
        }
    ];

    let answer = await inquirer.prompt(question);

    user.email = answer.email;
    user.password = answer.password;
    user.firstName = answer.firstName;
    user.lastName = answer.lastName;

    //console.log(`user: ${JSON.stringify(user, null, 4)}`);

    let authUser = await createAuthUserBootstrap(user);
    //console.log(`Created authUser: ${JSON.stringify(authUser, null, 4)}`);

    user.uid = authUser.uid;
    let newUser = await createFirestoreUserBootstrap(user);

    await setAuthAndFBClaims(authUser.uid, user);

}

async function copyDevToProd() {
    const dbDevUsersRef = dbALLRefs.dbDevUsersRef;
    const dbProdUsersRef = dbALLRefs.dbProdUsersRef;
    
    console.log("Copying users from dev to prod ...")
    dbDevUsersRef.get().then(snap => {
        snap.forEach(doc => {
            let user = {};
            user = doc.data();
            user.id = doc.id;
            // Now create the user with same ID
            // console.log(`User retrieved, user=${JSON.stringify(user)}`);
            dbProdUsersRef.doc(user.id).set(user).then(user => {
                //console.log(`Updated user ${JSON.stringify(user)}`);
            }).catch(err => {
                console.error(`error updating user: ${err}`);
            });
        });
    }).catch(err => {
        console.error(`error updating user: ${err}`);
    });

}

// Main menu
function mainMenu() {
    const menuItems = {
        seed: seedDatabase,
        deleteATCMembers: deleteATCMembers,
        uploadATCMembers: uploadATCMembers,
        createUsersFromGoogleActivities: createUsersFromGoogleActivities,
        createActivitiesFromGoogleDoc: createActivitiesFromGoogleDoc,
        copyUsersToDev: copyUsersToDev,
        copyDevToProd: copyDevToProd,
        QUIT: exitProgram
    };

    const question = {
        type: "list",
        name: "mainMenu",
        message: "\n\nWhat view do you want?",
        choices: Object.keys(menuItems)
    };

    inquirer.prompt(question).then(answer => {
        menuItems[answer.mainMenu]();
    });
}

// START
dbALLRefs = Util.getDBRefs();

mainMenu();