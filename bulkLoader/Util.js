const admin = require("./authServerCommon");

const PROD_ENV="prod"
const DEV_ENV="dev"

// const {ORG, ENV} = require("../ServerEnvironment");
const ORG="ATC"
const ENV="prod"
const CHALLENGE="ndqmG6qixVYrSoek4qJL";

class Util {

    static getBaseDBRefs (challengeUid) {
        if (!challengeUid) {
          challengeUid = CHALLENGE;
        }
        const db = admin.firestore();

        console.log(`ORG: ${ORG}, ENV: ${ENV}, CHALLENGE: ${CHALLENGE}`);
    
        const dbUsersRef = db.collection(ORG).doc(ENV).collection(`users`);
        const dbATCMembersRef = db.collection(ORG).doc(ENV).collection(`ATCMembers`);
        const dbChallengesRef = db.collection(ORG).doc(ENV).collection(`challenges`);
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

    static getDynamicDBRefs (env) {
      if (!env) {
        env = ENV;
      }
      const org = ORG;

      const db = admin.firestore();

      console.log(`ORG: ${org}, ENV: ${env}`);
  
      const dbUsersRef = db.collection(org).doc(env).collection(`users`);
      const dbATCMembersRef = db.collection(org).doc(env).collection(`ATCMembers`);
      const dbChallengesRef = db.collection(org).doc(env).collection(`challenges`);
        
      return {
        dbUsersRef: dbUsersRef,
        dbATCMembersRef: dbATCMembersRef,
        dbChallengesRef: dbChallengesRef,
      }
    }

    static getDynamicChallengeDBRefs (org, env, challengeUid) {
      if (!challengeUid) {
        challengeUid = CHALLENGE;
      }
      if (!env) {
        env = ENV;
      }
      if (!org) {
        org = ORG;
      }

      const db = admin.firestore();

      console.log(`ORG: ${org}, ENV: ${env}, CHALLENGE: ${challengeUid}`);
  
      const dbChallengeMembersRef = db.collection(org).doc(env).collection("challenges").doc(challengeUid).collection(`challengemembers`);        
      const dbActivitiesRef = db.collection(org).doc(env).collection("challenges").doc(challengeUid).collection(`activities`);
      const dbTeamsRef = db.collection(org).doc(env).collection("challenges").doc(challengeUid).collection(`teams`);
        
      return {
        challengeUid: challengeUid,

        dbChallengeMembersRef: dbChallengeMembersRef,
        dbActivitiesRef: dbActivitiesRef,
        dbTeamsRef: dbTeamsRef,
      }
    }

}    

module.exports = Util;