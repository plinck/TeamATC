"use strict";
const admin = require("../middleware/authServerCommon");
const {ORG, ENV} = require("../ServerEnvironment");

class Util {

    static getDBRefs (challengeId) {
        if (!challengeId) {
          challengeId = "9uxEvhpHM2cqCcn1ESZg";
        }
        const db = admin.firestore();
    
        const dbUsersRef = db.collection(ORG).doc(ENV).collection(`users`);
        const dbATCMembersRef = db.collection(ORG).doc(ENV).collection(`ATCMembers`);
    
        const dbChallengeMembersRef = db.collection(ORG).doc(ENV).collection("challenges").doc(challengeId).collection(`challengemembers`);        
        const dbActivitiesRef = db.collection(ORG).doc(ENV).collection("challenges").doc(challengeId).collection(`activities`);
        const dbTeamsRef = db.collection(ORG).doc(ENV).collection("challenges").doc(challengeId).collection(`teams`);
    
        return {dbUsersRef: dbUsersRef,
          dbATCMembersRef: dbATCMembersRef,
          dbChallengeMembersRef: dbChallengeMembersRef,
          dbActivitiesRef: dbActivitiesRef,
          dbTeamsRef: dbTeamsRef
        }
    }
}

module.exports = Util;
    