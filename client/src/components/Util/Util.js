import axios from 'axios';
import {
  ORG,
  ENV,
  CHALLENGE
} from "../Environment/Environment";
import Firebase from "../Auth/Firebase/firebase";
import Session from "../Util/Session.js";

// Util is used for various common functions
// It is not a REACT component but rather one thatg can be used
// within out outside react components
// It gives access to firebase context informaton and auth information
// without needing to use react context.  This way we can write more generic
// functions and classes that do not have wrapped in react compnents
class Util {
  // Formats a display money field 
  static formatMoney = (amount, decimalCount = 2, decimal = ".", thousands = ",") => {
    try {
      decimalCount = Math.abs(decimalCount);
      decimalCount = isNaN(decimalCount) ? 2 : decimalCount;

      const negativeSign = amount < 0 ? "-" : "";

      let i = parseInt(amount = Math.abs(Number(amount) || 0).toFixed(decimalCount)).toString();
      let j = (i.length > 3) ? i.length % 3 : 0;

      return negativeSign + (j ? i.substr(0, j) + thousands : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands) + (decimalCount ? decimal + Math.abs(amount - i).toFixed(decimalCount).slice(2) : "");
    } catch (err) {
      console.log(err);
    }
  };

  static getUserToken = async () => {
    const firebase = new Firebase();
    const token = await firebase.doRefreshToken(true);
    return token;
  }

  // need to get dbRefs based in on current infomratkjon so no hardocding
  static getBaseDBRefs = () => {
    const firebase = new Firebase();

    const user = Session.user;
    const challengeUid = user && user.challengeUid ? user.challengeUid : CHALLENGE;
    console.log(`challengeUid: ${challengeUid}`)

    const dbUsersRef = firebase.db.collection(ORG).doc(ENV).collection(`users`);
    const dbATCMembersRef = firebase.db.collection(ORG).doc(ENV).collection(`ATCMembers`);
    const dbChallengesRef = firebase.db.collection(ORG).doc(ENV).collection("challenges");

    return {
      dbUsersRef: dbUsersRef,
      dbATCMembersRef: dbATCMembersRef,
      dbChallengesRef: dbChallengesRef,
    }
  }

  // need to get dbRefs based in on current so no hardocding
  static promiseGetChallengeDBRefs = () => {
    const firebase = new Firebase();

    return new Promise((resolve, reject) => {

        Util.getCurrentUser().then(user => {
            const challengeUid = user.challengeUid ? user.challengeUid : CHALLENGE;
            console.log(`challengeUid: ${challengeUid}`)

            const dbChallengeMembersRef = firebase.db.collection(ORG).doc(ENV).collection("challenges").doc(challengeUid).collection(`challengemembers`);
            const dbActivitiesRef = firebase.db.collection(ORG).doc(ENV).collection("challenges").doc(challengeUid).collection(`activities`);
            const dbTeamsRef = firebase.db.collection(ORG).doc(ENV).collection("challenges").doc(challengeUid).collection(`teams`);

            resolve({
                dbChallengeMembersRef: dbChallengeMembersRef,
                dbActivitiesRef: dbActivitiesRef,
                dbTeamsRef: dbTeamsRef,
                challengeUid: challengeUid
            })
        }).catch (err => {
            console.error(`Error getting user: ${err}`);
            reject(err);
        });
    });
  }

  // This gets DBRefs based on the challengeUid passed vs the one in session to use for dealing
  // with challenges other than the one in the session
  static getChallengeDependentRefs = (challengeUid) => {
    const firebase = new Firebase();

    challengeUid = challengeUid ? challengeUid : CHALLENGE;
    console.log(`challengeUid: ${challengeUid}`)

    const dbChallengeMembersRef = firebase.db.collection(ORG).doc(ENV).collection("challenges").doc(challengeUid).collection(`challengemembers`);
    const dbActivitiesRef = firebase.db.collection(ORG).doc(ENV).collection("challenges").doc(challengeUid).collection(`activities`);
    const dbTeamsRef = firebase.db.collection(ORG).doc(ENV).collection("challenges").doc(challengeUid).collection(`teams`);

    return {
      dbChallengeMembersRef: dbChallengeMembersRef,
      dbActivitiesRef: dbActivitiesRef,
      dbTeamsRef: dbTeamsRef,
    }
  }

  static getCurrentAuthUser = async () => {
    const firebase = new Firebase();
    const currentAuthUser = await firebase.auth.currentUser;
    return currentAuthUser;
  }

  static getCurrentUser = () => {
    const firebase = new Firebase();
    const dbUsersRef = firebase.db.collection(ORG).doc(ENV).collection(`users`);
    // return a promise
    return new Promise((resolve, reject) => {
        let currentAuthUser = firebase.doGetCurrentUser();
        if (currentAuthUser) {
            dbUsersRef.doc(currentAuthUser.uid).get().then (doc => {
                let user = doc.data();
                user.id = doc.id; 
                resolve(user);
            }).catch(err => {
                console.error(`Error getting current user: ${err}`)
                reject(err)
            });
        } else {
            reject(`User not logged in`);
        }
    });
  }

  static getFirestoreDB = () => {
    const firebase = new Firebase();
    const db = firebase.db;
    return db;
  }

  static getFirebaseAuth = () => {
    const firebase = new Firebase();
    return firebase;
  }


  static getFirebaseFirestore = () => {
    const firebase = new Firebase();
    const fb = firebase.firestore;

    return fb;
  }

  static apiGet = async (api) => {
    const firebase = new Firebase();
    const token = await firebase.doRefreshToken(true);
    return (axios.get(api, {
      headers: {
        "FIREBASE_AUTH_TOKEN": token
      }
    }));
  }


  static apiGetNoToken = (api) => {
    return (axios.get(api));
  }

  static apiPost = async (api, param) => {
    const firebase = new Firebase();
    const token = await firebase.doRefreshToken(true);
    return (axios.post(api, param, {
      headers: {
        "FIREBASE_AUTH_TOKEN": token
      }
    }));
  }

  // This is to call backend when not authorixed
  static apiPostNoToken = async (api, param) => {
    return (axios.post(api, param));
  }

} // class

export default Util;