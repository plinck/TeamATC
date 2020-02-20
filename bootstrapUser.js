"use strict";
const admin = require("../middleware/authServerCommon");

// Set csutom claim without overrding other claim
function setAuthClaims(uid, customClaims) {
  return new Promise(async (resolve, reject) => {
    // get current stat of all claims
    let updatedClaims = await getClaims(uid);

    // Only update claims passed keeping existing claims
    if (customClaims && customClaims.admin != null) updatedClaims.admin = customClaims.admin;
    if (customClaims && customClaims.cashier != null) updatedClaims.cashier = customClaims.cashier;
    if (customClaims && customClaims.banker != null) updatedClaims.banker = customClaims.banker;
    if (customClaims && customClaims.user != null) updatedClaims.user = customClaims.user;

    // The name is the *primary* role as someone can be admin and banker for example
    if (updatedClaims.admin) {
      updatedClaims.name = "admin";
    } else if (updatedClaims.cashier) {
      updatedClaims.name = "cashier";
    } else if (updatedClaims.banker) {
      updatedClaims.name = "banker";
    } else if (updatedClaims.user) {
      updatedClaims.name = "user";
    } else {
      updatedClaims.name = "noclaims";
    }

    admin.auth().setCustomUserClaims(uid, updatedClaims).then(() => {
      resolve(updatedClaims);
    }).catch(err => {
      console.error("Error updating claims in AuthUserAPI", err);
      resolve(updatedClaims);
    });
  }); // promise
}

function updateClaimsInFirebase(uid, claims, authClaims) {
  return new Promise(async (resolve, reject) => {
    const db = admin.firestore();
    // Init claims for primary since you can be multiple
    let updateFields = {
      claims: claims
    };

    // Only *set* claims passed
    if (authClaims && authClaims.admin != null) updateFields.isAdmin = authClaims.admin;
    if (authClaims && authClaims.cashier != null) updateFields.isCashier = authClaims.cashier;
    if (authClaims && authClaims.banker != null) updateFields.isBanker = authClaims.banker;
    if (authClaims && authClaims.user != null) updateFields.isUser = authClaims.user;

    // update claims
    db.collection('users').doc(uid).set(updateFields, {
      merge: true
    }).then(() => {
      resolve();
    }).catch(err => {
      console.error(`Error updating claims ${err}`);
      reject(err);
    });
  });
}

function setAuthAndFBClaims(uid) {
  try {
    // Now, set custom claims
    setAuthClaims(uid, {
      admin: true,
      cashier: true,
      banker: true,
      user: true
    }).then(async (newClaims) => {
      try {
        await updateClaimsInFirebase(uid, newClaims.name, newClaims);
        console.log(uid);
      } catch (err) {
        console.error(`Error caught in "await updateClaimsInFirebase" ${err}`);
      }
    });
  } catch (err) {
    // catch all error
    console.error(`Error caught in route app.post("/api/auth/setCashier..." ${err}`);
  }
}; // Route

function createUserBootstrap(user) {
  console.log(`trying to update user in fb: ${user}`);
  return new Promise(async (resolve, reject) => {
    const db = admin.firestore();;

    // update
    console.log("User updated, user=", user);
    db.collection('users').doc(user.uid).set({
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

// Route for Creating a new user with email and password
function createAuthUserBootstrap(user) {
  // Generate random password
  let user = {
    email: "paull@linck.net",
    password: "123456",
    firstName: "Paul",
    lastName: "LinckNET",
    disabled: false
  };

  try {
    // Create auth user
    admin.auth().createUser({
        email: user.email,
        emailVerified: true,
        password: user.password,
        displayName: `${user.firstName} ${user.lastName}`,
        disabled: false
      })
      .then((authUser) => {
        console.log('Successfully added auth user');
        return authUser;
      })
      .catch((err) => {
        console.error('Error creating auth user:', err);
        return;
      });
  } catch (err) {
    // catch all error
    console.error(`Error caught in route app.post("/api/auth/createUser..." ${err.errors[0].message}`);
    return;
  }
};

// Main
// let user = {
//     uid: null,
//     email: "paull@linck.net",
//     password: "123456",
//     firstName: "Paul",
//     lastName: "LinckNET",
//     phoneNumber: "404-687-1115",
//     photoURL: ""
//     disabled: false
// };

// let authUser = createAuthUserBootstrap(user);
// user.uid = authUser.uid;
// createUserBootstrap(user);
// setAuthAndFBClaims(authUser.uid, user);
