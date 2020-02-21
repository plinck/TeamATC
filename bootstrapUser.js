"use strict";
const inquirer = require("inquirer");

const ORG = "ATC";
const DEV_ENV = "dev";
const PROD_ENV = "prod";
const STAGE_ENV = "stage";
const USERS_DB=`users`

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
        if (authClaims && authClaims.cashier != null)
            updateFields.isCashier = authClaims.cashier;
        if (authClaims && authClaims.banker != null)
            updateFields.isBanker = authClaims.banker;
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
        // The name is the *primary* role as someone can be admin and banker for example
        if (customClaims.admin) {
            customClaims.name = "admin";
        } else if (customClaims.cashier) {
            customClaims.name = "cashier";
        } else if (customClaims.banker) {
            customClaims.name = "banker";
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
            cashier: true,
            banker: true,
            user: true
        })
            .then(async newClaims => {
                await updateClaimsInFirebase(uid, newClaims.name, newClaims);
                resolve();
            })
            .catch(err => {
                // catch all error
                console.error(
                    `Error caught in route app.post("/api/auth/setCashier..." ${err}`
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
            .set(
                {
                    firstName: user.firstName,
                    lastName: user.lastName,
                    displayName: `${user.firstName} ${user.lastName}`,
                    phoneNumber: user.phoneNumber,
                    email: user.email,
                    photoURL: user.photoURL ? user.photoURL : ""
                },
                {
                    merge: true
                }
            )
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

    const question = [
        {
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
        displayUsers: showUsers,
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
