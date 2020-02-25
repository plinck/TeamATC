"use strict";
const inquirer = require("inquirer");
let fs = require('fs');


const ORG = "ATC";
const DEV_ENV = "dev";
const PROD_ENV = "prod";
const STAGE_ENV = "stage";
const USERS_DB = `users`

require("dotenv");
const path = require("path");

// Need to use firebase admin to get at firebase stuff in node
const admin = require("firebase-admin");
const storageBucket = "teamatc-challenge.appspot.com";
const databaseURL = "https://teamatc-challenge.firebaseio.com";

function exitProgram() {
    console.log("BYE!");
}
// Copy Users from current location to DEV
async function matchChallengeUsersCreateAuthAndUser(fileToUpload) {
    const db = admin.firestore();
    const dbUserRef = db.collection(`${ORG}`).doc(`${DEV_ENV}`).collection(`users`)
    const dbMemberRef = db.collection(`${ORG}`).doc(`${DEV_ENV}`).collection(`ATCMembers`)

    // First Read and Parse All from ATC CSV file to grab participating users
    if (!fileToUpload) {
        fileToUpload = "ATCActivities.csv";
    }
    console.log(`Matching Challenge Users to Members and then users from ${fileToUpload}`);

    // read  the file and parse
    let ATCMembers = [];

    if (fileToUpload) {
        fs.readFile(fileToUpload, 'utf8', (err, data) => {
                //
                if (err) throw err;
                console.log(`OK reading file`);
                let totalActivities = 0;
                let totalMembers = 0;
 
                //remove the quotes
                let fixedData = data.replace(/["]*/g, "");
                let lines = fixedData.split('\r');
                // 1/15/2020 10:00:53,Laurie Nicholson,1/15/2020,Run,3.4,Rahuligan,Miles (Bike and Run)

                let logged = 0;
                let ChallengeActivities = lines.map((line) => {
                    let activityFieldsArray = line.split(',');

                    let dateString = activityFieldsArray[0];
                    let activityDateTime = new Date(dateString);
                    let displayName = activityFieldsArray[1].trim();
                    let displayNameArray = displayName.split(" ");
                    let firstName = displayNameArray[0];
                    let lastName = displayNameArray.length > 0 ? displayNameArray[1] : "X";
                    if (logged < 10) {
                        console.log(`lastName: ${lastName}`);
                    }

                    let uselessDate = activityFieldsArray[2].trim();
                    let activityType = activityFieldsArray[3].trim();
                    let distance = Number(activityFieldsArray[4]);
                    let teamName = activityFieldsArray[5].trim();

                    // lastName = lastName.length < 1 ? " " : lastName.trim().toLowerCase();
                    firstName = firstName.trim().toLowerCase();

                    //lastName = lastName.charAt(0).toUpperCase() + lastName.slice(1)
                    firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1)
                    activityType = activityType.charAt(0).toUpperCase() + activityType.slice(1)
                    teamName = teamName.charAt(0).toUpperCase() + teamName.slice(1)
                    let distanceUnits = activityType === "Swim" ? "Yards" : "Miles"

                    let activityPosted = {
                        activityDateTime: activityDateTime,
                        activityType: activityType,
                        displayName: displayName,
                        distance: distance,
                        distanceUnits: distanceUnits,
                        firstName: firstName,
                        lastName: lastName,
                        teamName: teamName
                    }
                    if (logged < 10) {
                        console.log(`Line: ${line}, activity: ${activityFieldsArray}`);
                        console.log(`Activity Posted: ${JSON.stringify(activityPosted)}`);
                        logged += 1;
                    }

                    totalActivities += 1;
    
                    return (activityPosted);
                });

                let ChallengeMembersAlreadyExists = [];
                let ChallengeMembers = [];

                for (let i = 0; i < ChallengeActivities.length; i++) {
                    if (ChallengeMembersAlreadyExists[ChallengeActivities[i].displayName]) {
                        continue;
                    } else {
                        
                        ChallengeMembersAlreadyExists[ChallengeActivities[i].displayName] = true;
                        let member = {
                            displayName: ChallengeActivities[i].displayName,
                            distanceUnits: ChallengeActivities[i].distanceUnits,
                            firstName: ChallengeActivities[i].firstName,
                            lastName: ChallengeActivities[i].lastName,
                            teamName: ChallengeActivities[i].teamName
                        }

                        ChallengeMembers.push(member);
                        totalMembers += 1;

                        console.log(`Unique Member: ${JSON.stringify(member)}`);
                    }
                }
                console.log(`Found ATCActitities: ${totalActivities}, Challenge Members: ${totalMembers}`)
        })
    }
}


// Copy Users from current location to DEV
async function copyUsersToDev() {
    const db = admin.firestore();
    const dbCollSource = `users`;
    const dbCollDest = `${DEV_DB}/users`;

    console.log(`Copying users from ${dbCollSource} to ${dbCollDest}`);
    return new Promise(async (resolve, reject) => {

        return new Promise((resolve, reject) => {
            const db = admin.firestore();

            db.collection(dbCollSource)
                .get()
                .then(querySnapshot => {
                    let users = [];
                    querySnapshot.forEach(doc => {
                        let user = {};
                        user = doc.data();
                        user.id = doc.id;
                        users.push(user);

                        // Now create the user with same ID
                        console.log(`User retrieved, user=${JSON.stringify(user)}`);
                        // db.collection(dbCollDest)
                        db.collection(`${ORG}`).doc(`${DEV_ENV}`).collection(`${USERS_DB}`)
                            .doc(user.id)
                            .set(user)
                            .then(user => {
                                console.log(
                                    `Updated user ${JSON.stringify(user)}`
                                );
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
    });
}

async function deleteATCMembers() {
    const db = admin.firestore();

    // use email address as key to overwrite duplicates
    let dbRef = db.collection(`${ORG}`).doc(`${DEV_ENV}`).collection("ATCMembers");

    dbRef.listDocuments().then(val => {
        val.map((val) => {
            val.delete()
        })
    })

}

// Copy Users from current location to DEV
async function uploadATCMembers(fileToUpload) {
    const db = admin.firestore();

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
                let emailAddress = memberArray[2].trim();

                lastName = lastName.charAt(0).toUpperCase() + lastName.slice(1)
                firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1)

                let member = {
                    lastName: lastName,
                    firstName: firstName,
                    emailAddress: emailAddress
                };
                //console.log(`Member: ${JSON.stringify(member)}`); 
                return (member);
            });

            let _ = ATCMembers.map((member) => {
                console.log(`Trying to update ${JSON.stringify(member)}`);

                // use email address as key to overwrite duplicates
                db.collection(`${ORG}`).doc(`${DEV_ENV}`).collection("ATCMembers")
                    .doc(member.emailAddress)
                    .set(member)
                    .then(memberId => {
                        console.log(
                            `Updated member ${JSON.stringify(member)} with id: ${memberId}`
                        );
                    })
                    .catch(err => {
                        console.error(`error updating user: ${err}`);
                    });
            });
        }); // MAP
    }
}


// update claims from auth into FB
function updateClaimsInFirebase(uid, claims, authClaims) {
    return new Promise(async (resolve, reject) => {
        const db = admin.firestore();
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
        db.collection("users")
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
                await updateClaimsInFirebase(uid, newClaims.name, newClaims);
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

async function createUserBootstrap(user) {
    console.log(`trying to update user in fb: ${user}`);
    return new Promise(async (resolve, reject) => {
        const db = admin.firestore();

        // update
        console.log("User updated, user=", user);
        db.collection("users")
            .doc(user.uid)
            .set({
                firstName: user.firstName,
                lastName: user.lastName,
                displayName: `${user.firstName} ${user.lastName}`,
                phoneNumber: user.phoneNumber,
                email: user.email,
                photoURL: user.photoURL ? user.photoURL : ""
            }, {
                merge: true
            })
            .then(user => {
                console.log(`Updated user to: ${JSON.stringify(user)}`);
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
    console.log(
        `trying to createAuthUserBootstrap: ${JSON.stringify(user, null, 2)}`
    );
    return new Promise(async (resolve, reject) => {
        // Create auth user
        admin
            .auth()
            .createUser({
                email: user.email,
                emailVerified: true,
                password: user.password,
                displayName: `${user.firstName} ${user.lastName}`,
                disabled: false
            })
            .then(authUser => {
                console.log("Successfully added auth user");
                resolve(authUser);
            })
            .catch(err => {
                console.error("Error creating auth user:", err);
                reject(err);
            });
    });
}

async function showUsers() {
    console.log(`user: ${JSON.stringify(user, null, 4)}`);
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

    console.log(`user: ${JSON.stringify(user, null, 4)}`);

    let authUser = await createAuthUserBootstrap(user);
    console.log(`Created authUser: ${JSON.stringify(authUser, null, 4)}`);

    user.uid = authUser.uid;
    let newUser = await createUserBootstrap(user);

    await setAuthAndFBClaims(authUser.uid, user);

    exitProgram();
    return;
}

// Main menu
function mainMenu() {
    const menuItems = {
        seed: seedDatabase,
        deleteATCMembers: deleteATCMembers,
        uploadATCMembers: uploadATCMembers,
        matchChallengeUsersCreateAuthAndUser: matchChallengeUsersCreateAuthAndUser,
        copyUsersToDev: copyUsersToDev,
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
const serviceAccount = require(path.join(
    __dirname,
    "./.serviceAccountKeyBootstrap.json"
));
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: databaseURL,
    storageBucket: storageBucket
});

mainMenu();