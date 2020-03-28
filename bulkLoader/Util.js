const admin = require("./authServerCommon");

const PROD_ENV="prod"
const DEV_ENV="dev"

// const {ORG, ENV} = require("../ServerEnvironment");
const ORG="ATC"
const ENV="dev"
const CHALLENGE="mFpSMP7oWvriDwIehwzB";

class Util {

    static getBaseDBRefs (challengeUid) {
        if (!challengeUid) {
          challengeUid = CHALLENGE;
        }
        const db = admin.firestore();

        console.log(`ORG: ${ORG}, ENV: ${ENV}, CHALLENGE: ${CHALLENGE}`);
    
        const dbUsersRef = db.collection(ORG).doc(ENV).collection(`users`);
        const dbATCMembersRef = db.collection(ORG).doc(ENV).collection(`ATCMembers`);
        const dbChallengesRef = db.collection(ORG).doc(ENV).collection(`Challenges`);
        const dbChallengeMembersRef = db.collection(ORG).doc(ENV).collection("challenges").doc(challengeUid).collection(`challengemembers`);        
        const dbActivitiesRef = db.collection(ORG).doc(ENV).collection("challenges").doc(challengeUid).collection(`activities`);
        const dbTeamsRef = db.collection(ORG).doc(ENV).collection("challenges").doc(challengeUid).collection(`teams`);

        // Prod
        const dbProdUsersRef = db.collection(ORG).doc(PROD_ENV).collection(`users`);
        const dbProdATCMembersRef = db.collection(ORG).doc(PROD_ENV).collection(`ATCMembers`);
        const dbProdChallengesRef = db.collection(ORG).doc(PROD_ENV).collection(`challenges`);
        const dbProdATCChallengeMemberRef = db.collection(ORG).doc(PROD_ENV).collection("challenges").doc(challengeUid).collection(`challengemembers`);        
        const dbProdActivitiesRef = db.collection(ORG).doc(PROD_ENV).collection("challenges").doc(challengeUid).collection(`activities`);
        const dbProdTeamsRef = db.collection(ORG).doc(PROD_ENV).collection("challenges").doc(challengeUid).collection(`teams`);
        
        // Dev
        const dbDevUsersRef = db.collection(ORG).doc(DEV_ENV).collection(`users`);
        const dbDevATCMembersRef = db.collection(ORG).doc(DEV_ENV).collection(`ATCMembers`);
        const dbDevChallengesRef = db.collection(ORG).doc(DEV_ENV).collection(`challenges`);
        const dbDevATCChallengeMemberRef = db.collection(ORG).doc(DEV_ENV).collection("challenges").doc(challengeUid).collection(`challengemembers`);        
        const dbDevActivitiesRef = db.collection(ORG).doc(DEV_ENV).collection("challenges").doc(challengeUid).collection(`activities`);
        const dbDevTeamsRef = db.collection(ORG).doc(DEV_ENV).collection("challenges").doc(challengeUid).collection(`teams`);
    
        return {
          challengeUid: challengeUid,

          dbUsersRef: dbUsersRef,
          dbATCMembersRef: dbATCMembersRef,
          dbChallengesRef: dbChallengesRef,
          dbChallengeMembersRef: dbChallengeMembersRef,
          dbActivitiesRef: dbActivitiesRef,
          dbTeamsRef: dbTeamsRef,

          dbProdUsersRef: dbProdUsersRef,
          dbProdATCMembersRef: dbProdATCMembersRef,
          dbProdChallengesRef: dbProdChallengesRef,
          dbProdATCChallengeMemberRef: dbProdATCChallengeMemberRef,
          dbProdActivitiesRef: dbProdActivitiesRef,
          dbProdTeamsRef: dbProdTeamsRef,

          dbDevUsersRef: dbDevUsersRef,
          dbDevATCMembersRef: dbDevATCMembersRef,
          dbDevChallengesRef: dbDevChallengesRef,
          dbDevATCChallengeMemberRef: dbDevATCChallengeMemberRef,
          dbDevActivitiesRef: dbDevActivitiesRef,
          dbDevTeamsRef: dbDevTeamsRef,          
        }
    }
}    

module.exports = Util;