const admin = require("./authServerCommon");

const PROD_ENV="prod"
const DEV_ENV="dev"

// const {ORG, ENV} = require("../ServerEnvironment");
const ORG="ATC"
const ENV="prod"

class Util {

    static getDBRefs (challengeId) {
        if (!challengeId) {
          challengeId = "9uxEvhpHM2cqCcn1ESZg";
        }
        const db = admin.firestore();

        console.log(`ORG: ${ORG}, ENV: ${ENV}`);
    
        const dbUsersRef = db.collection(ORG).doc(ENV).collection(`users`);
        const dbATCMembersRef = db.collection(ORG).doc(ENV).collection(`ATCMembers`);
        const dbChallengesRef = db.collection(ORG).doc(ENV).collection(`Challenges`);
        const dbATCChallengeMemberRef = db.collection(ORG).doc(ENV).collection("challenges").doc(challengeId).collection(`atcchallengemembers`);        
        const dbActivitiesRef = db.collection(ORG).doc(ENV).collection("challenges").doc(challengeId).collection(`activities`);
        const dbTeamsRef = db.collection(ORG).doc(ENV).collection("challenges").doc(challengeId).collection(`teams`);

        // Prod
        const dbProdUsersRef = db.collection(ORG).doc(PROD_ENV).collection(`users`);
        const dbProdATCMembersRef = db.collection(ORG).doc(PROD_ENV).collection(`ATCMembers`);
        const dbProdChallengesRef = db.collection(ORG).doc(PROD_ENV).collection(`challenges`);
        const dbProdATCChallengeMemberRef = db.collection(ORG).doc(PROD_ENV).collection("challenges").doc(challengeId).collection(`atcchallengemembers`);        
        const dbProdActivitiesRef = db.collection(ORG).doc(PROD_ENV).collection("challenges").doc(challengeId).collection(`activities`);
        const dbProdTeamsRef = db.collection(ORG).doc(PROD_ENV).collection("challenges").doc(challengeId).collection(`teams`);
        
        // Dev
        const dbDevUsersRef = db.collection(ORG).doc(DEV_ENV).collection(`users`);
        const dbDevATCMembersRef = db.collection(ORG).doc(DEV_ENV).collection(`ATCMembers`);
        const dbDevChallengesRef = db.collection(ORG).doc(DEV_ENV).collection(`challenges`);
        const dbDevATCChallengeMemberRef = db.collection(ORG).doc(DEV_ENV).collection("challenges").doc(challengeId).collection(`atcchallengemembers`);        
        const dbDevActivitiesRef = db.collection(ORG).doc(DEV_ENV).collection("challenges").doc(challengeId).collection(`activities`);
        const dbDevTeamsRef = db.collection(ORG).doc(DEV_ENV).collection("challenges").doc(challengeId).collection(`teams`);
    
        return {
          dbUsersRef: dbUsersRef,
          dbATCMembersRef: dbATCMembersRef,
          dbChallengesRef: dbChallengesRef,
          dbATCChallengeMemberRef: dbATCChallengeMemberRef,
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