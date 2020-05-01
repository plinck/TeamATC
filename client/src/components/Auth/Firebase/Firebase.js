import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/database';
import 'firebase/functions';
import 'firebase/storage';
import 'firebase/performance';
import { FB_CONFIG } from "../../Environment/Environment"

const firebaseConfig = {
  apiKey: FB_CONFIG.API_KEY,
  authDomain: FB_CONFIG.AUTH_DOMAIN,
  databaseURL: FB_CONFIG.DATABASE_URL,
  projectId: FB_CONFIG.PROJECT_ID,
  storageBucket: FB_CONFIG.STORAGE_BUCKET,
  messagingSenderId: FB_CONFIG.MESSAGING_SENDER_ID,
  appId: FB_CONFIG.APP_ID,
  measurementId: FB_CONFIG.MEASUREMENT_ID
};

// Firebase state already initialized so we dont do more that once
// Kinda like a statuc property
class Firebase {
  static firebaseInialized = undefined;

  constructor() {
    try {
      if (!this.firebaseInialized) {
        firebase.initializeApp(firebaseConfig);
        this.firebaseInialized = true;
        if (FB_CONFIG.RUN_FUNCTIONS_LOCALLY === "local") {
          console.log("Using local FB Functions");
          firebase.functions().useFunctionsEmulator('http://localhost:5001');
        }

      }
    } catch (err) {
      // we skip the "already exists" message which is
      // not an actual error when we're hot-reloading
      if (!/already exists/.test(err.message)) {
        console.error('Firebase initialization error', err.stack)
      }
    }

    this.currentAuthUser = firebase.auth().currentUser;
    this.auth = firebase.auth();
    this.db = firebase.firestore();
    this.functions = firebase.functions();
    this.storage = firebase.storage();
    this.perf = firebase.performance();
    this.realtimeDB = firebase.database();
  }

  doGetCurrentUser = () => {
    return this.auth.currentUser;
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
