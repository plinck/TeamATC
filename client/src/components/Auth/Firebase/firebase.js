import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/functions';

// For the life of me I cant get REACT (when in client/) to read ENV vars and google isnt helping me ...
// Firebase Config using react env
// const config = {
//   apiKey: process.env.REACT_APP_API_KEY,
//   authDomain: process.env.REACT_APP_AUTH_DOMAIN,
//   databaseURL: process.env.REACT_APP_DATABASE_URL,
//   projectId: process.env.REACT_APP_PROJECT_ID,
//   storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
//   messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID
// };
const config = {
  apiKey: "AIzaSyDCddfdNSdSf19cWK7je91aJtlyh3zBp4Q",
  authDomain: "project3-noahpauljj-fintech2.firebaseapp.com",
  databaseURL: "https://project3-noahpauljj-fintech2.firebaseio.com",
  projectId: "project3-noahpauljj-fintech2",
  storageBucket: "project3-noahpauljj-fintech2.appspot.com",
  messagingSenderId: "87243866145"
};

// Firebase state already initialized so we dont do more that once
// Kinda like a statuc property
let firebaseInialized;
class Firebase {
  constructor() {
    try {
      if (!firebaseInialized) {
        firebase.initializeApp(config);
        firebaseInialized = true;
      }
    } catch (err) {
      // we skip the "already exists" message which is
      // not an actual error when we're hot-reloading
      if (!/already exists/.test(err.message)) {
        console.error('Firebase initialization error', err.stack)
      }
    }

    this.auth = firebase.auth();
    this.db = firebase.firestore();
    this.functions = firebase.functions();
  }

  doRefreshToken = () => {
    return new Promise((resolve, reject) => {
      if (this.auth.currentUser !== null) {
        this.auth.currentUser.getIdToken(true).then((idToken) => {
          resolve(idToken);
        }).catch((err) => {
          console.error(`Firebase refresh id token failed: ${err}`);
          reject(err);
        });
      }
    });
  }

  // get custom claims
  doGetAllCustomClaims = () => {
    return new Promise((resolve, reject) => {
      this.auth.currentUser.getIdTokenResult()
        .then((idTokenResult) => {
          if (idTokenResult.claims.admin) {
            resolve("admin");
          } else if (idTokenResult.claims.cashier) {
            resolve("cashier");
          } else {
            resolve("user");
          }
        })
        .catch((err) => {
          console.error(err);
          reject(err);
        });
    });//promise
  }// method  
  // get custom claims
  doGetUserRole = () => {
    return new Promise((resolve, reject) => {
      this.auth.currentUser.getIdTokenResult()
        .then((idTokenResult) => {
          let claims = {
            isAdmin: idTokenResult.claims ? idTokenResult.claims.admin : false,
            isCashier: idTokenResult.claims ? idTokenResult.claims.cashier : false,
            isBanker: idTokenResult.claims ? idTokenResult.claims.banker : false,
            isUser: idTokenResult.claims ? idTokenResult.claims.user : false
          };

          // The name is the *primary* role as someone can be admin and banker for example
          if (idTokenResult.claims.admin) {
            claims.name = "admin";
            resolve(claims);
          } else if (idTokenResult.claims.cashier) {
            claims.name = "cashier";
            resolve(claims);
          } else if (idTokenResult.claims.banker) {
            claims.name = "banker";
            resolve(claims);
          } else {
            claims.name = "user";
            resolve(claims);
          }
        })
        .catch((err) => {
          console.error(err);
          reject(err);
        });
    });//promise
  }// method  

  // get custom claims
  doIsUserAdmin = () => {
    return new Promise((resolve, reject) => {
      this.auth.currentUser.getIdTokenResult()
        .then((idTokenResult) => {
          // Confirm the user is an Admin.
          // Note double bangs is used to convert truthy/falsy to true/fale
          if (!!idTokenResult.claims.admin) {
            resolve(true);
          } else {
            resolve(false);
          }
        })
        .catch((err) => {
          console.error(err);
          reject(err);
        });
    });//promise
  }// method

  // get custom claims
  doIsUserBanker = () => {
    return new Promise((resolve, reject) => {
      this.auth.currentUser.getIdTokenResult()
        .then((idTokenResult) => {
          // Confirm the user is an Admin.
          // Note double bangs is used to convert truthy/falsy to true/fale
          if (!!idTokenResult.claims.banker) {
            resolve(true);
          } else {
            resolve(false);
          }
        })
        .catch((err) => {
          console.error(err);
          reject(err);
        });
    });//promise
  }// method


  doIsUserCashier = () => {
    return new Promise((resolve, reject) => {
      this.auth.currentUser.getIdTokenResult()
        .then((idTokenResult) => {
          // Confirm the user is an Admin.
          if (!!idTokenResult.claims.cashier) {
            resolve(true);
          } else {
            resolve(false);
          }
        })
        .catch((err) => {
          console.error(err);
          reject(err);
        });
    });//promise
  }// method


  // *** Firebase Auth API ***
  doCreateUserWithEmailAndPassword = (email, password) => {
    return new Promise((resolve, reject) => {
      this.auth.createUserWithEmailAndPassword(email.toLowerCase(), password).then((authData) => {
        console.log("User created successfully with payload-", authData);
        return resolve(authData);
      }).catch((err) => {
        console.error("User create failed!", err);
        return reject(err);
      });
    }); // Promise  
  }

  doSignInWithEmailAndPassword = (email, password) => {
    return new Promise((resolve, reject) => {
      this.auth.signInWithEmailAndPassword(email.toLowerCase(), password).then((authData) => {
        console.log("User logged in successfully with payload-", authData);
        return resolve(authData);
      }).catch((err) => {
        console.error("Login Failed!", err);
        return reject(err);
      })
    }); // Promise
  }

  doSignInWithGoogle = () => {
    //return this.auth.signInWithRedirect(new firebase.auth.GoogleAuthProvider());
    return (this.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()));
  }

  doGetRedirectResult = () => {
    return this.auth.getRedirectResult();
  }


  doSignOut = () => {
    return (this.auth.signOut());
  }

  doPasswordReset = (email) => {
    return new Promise((resolve, reject) => {
      this.auth.sendPasswordResetEmail(email.toLowerCase()).then((authData) => {
        console.log("User email reset sent successfully with payload-", authData);
        return resolve(authData);
      }).catch((err) => {
        console.error("Login Failed!", err);
        return reject(err);
      });
    }); // Promise
  }

  doPasswordUpdate = (password) => {
    return new Promise((resolve, reject) => {
      this.auth.currentUser.updatePassword(password).then((authData) => {
        console.log("User email reset sent successfully with payload-", authData);
        return resolve(authData);
      }).catch((err) => {
        console.error("Login Failed!", err);
        return reject(err);
      });
    }); // Promise
  }
}

export default Firebase;