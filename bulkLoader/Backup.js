const Util = require("./Util.js");
const ORG="ATC"
const DEV="dev"
const PROD="prod"
const BACK="backup"

class Backup {
    static async copyDevToProd() {
        const dbDevUsersRef = dbALLRefs.dbDevUsersRef;
        const dbDevATCMembersRef = dbALLRefs.dbDevATCMembersRef;
        const dbDevChallengesRef = dbALLRefs.dbDevChallengesRef;
        const dbDevATCChallengeMemberRef = dbALLRefs.dbDevATCChallengeMemberRef;
        const dbDevActivitiesRef = dbALLRefs.dbDevActivitiesRef;
        const dbDevTeamsRef = dbALLRefs.dbDevTeamsRef;
        
        const dbProdUsersRef = dbALLRefs.dbProdUsersRef;
        const dbProdATCMembersRef = dbALLRefs.dbProdATCMembersRef;
        const dbProdChallengesRef = dbALLRefs.dbProdChallengesRef;
        const dbProdATCChallengeMemberRef = dbALLRefs.dbProdATCChallengeMemberRef;
        const dbProdActivitiesRef = dbALLRefs.dbProdActivitiesRef;
        const dbProdTeamsRef = dbALLRefs.dbProdTeamsRef;
    
        console.log(`Copying users from ${DEV} to ${PROD} ...`)
        dbDevUsersRef.get().then(snap => {
            snap.forEach(doc => {
                let docData = doc.data();
                dbProdUsersRef.doc(doc.id).set(docData).then(newDoc => {
                    return;
                });
            });
        }).then( () => {
            console.log(`Copied all users from ${DEV} to ${PROD}`);
        }).catch(err => {
            console.error(`error updating user: ${err}`);
        });
    
        console.log(`Copying ATCMembers from ${DEV} to ${PROD} ...`);
        dbDevATCMembersRef.get().then(snap => {
            snap.forEach(doc => {
                let docData = doc.data();
                dbProdATCMembersRef.doc(doc.id).set(docData).then(newDoc => {
                    return;
                });
            });
        }).then( () => {
            console.log(`Copied all ATCMembers from ${DEV} to ${PROD}`);
        }).catch(err => {
            console.error(`error updating ATCMembers: ${err}`);
        });
    
        console.log(`Copying challenges from ${DEV} to ${PROD} ...`)
        dbDevChallengesRef.get().then(snap => {
            snap.forEach(doc => {
                let docData = doc.data();
                dbProdChallengesRef.doc(doc.id).set(docData).then(newDoc => {
                    return;
                });
            });
        }).then( () => {
            console.log(`Copied all Challenges from ${DEV} to ${PROD}`);
        }).catch(err => {
            console.error(`error updating Challenges: ${err}`);
        });
    
        console.log(`Copying challengeMembers from ${DEV} to ${PROD} ...`);
        dbDevATCChallengeMemberRef.get().then(snap => {
            snap.forEach(doc => {
                let docData = doc.data();
                dbProdATCChallengeMemberRef.doc(doc.id).set(docData).then(newDoc => {
                    return;
                });
            });
        }).then( () => {
            console.log(`Copied all challengeMembers from ${DEV} to ${PROD}`);
        }).catch(err => {
            console.error(`error updating challengeMembers: ${err}`);
        });
    
        console.log(`Copying challengeActivities from ${DEV} to ${PROD} ...`);
        dbDevActivitiesRef.get().then(snap => {
            snap.forEach(doc => {
                let docData = doc.data();
                dbProdActivitiesRef.doc(doc.id).set(docData).then(newDoc => {
                    return;
                });
            });
        }).then( () => {
            console.log(`Copied all challengeActivities from ${DEV} to ${PROD}`);
        }).catch(err => {
            console.error(`error updating challengeActivities: ${err}`);
        });
    
        console.log(`Copying teams from ${DEV} to ${PROD} ...`);
        dbDevTeamsRef.get().then(snap => {
            snap.forEach(doc => {
                let docData = doc.data();
                dbProdTeamsRef.doc(doc.id).set(docData).then(newDoc => {
                    return;
                });
            });
        }).then( () => {
            console.log(`Copied all teams from ${DEV} to ${PROD}`);
        }).catch(err => {
            console.error(`error updating teams: ${err}`);
        });
    
    
    }

    static copyChallengeProdToBack(challengeUid) {
        const dbChallengeProdRefs = Util.getDynamicChallengeDBRefs(ORG, PROD, challengeUid)
        const dbProdATCChallengeMemberRef = dbChallengeProdRefs.dbChallengeMembersRef;
        const dbProdActivitiesRef = dbChallengeProdRefs.dbActivitiesRef;
        const dbProdTeamsRef = dbChallengeProdRefs.dbTeamsRef;

        const dbChallengeBackRefs = Util.getDynamicChallengeDBRefs(ORG, BACK, challengeUid)
        const dbBackATCChallengeMemberRef = dbChallengeBackRefs.dbChallengeMembersRef;
        const dbBackActivitiesRef = dbChallengeBackRefs.dbActivitiesRef;
        const dbBackTeamsRef = dbChallengeBackRefs.dbTeamsRef;


        console.log(`Copying challengeMembers from ${PROD} to ${BACK} ...`)
        dbProdATCChallengeMemberRef.get().then(snap => {
            snap.forEach(doc => {
                let docData = doc.data();
                dbBackATCChallengeMemberRef.doc(doc.id).set(docData).then(newDoc => {
                    return;
                });
            });
        }).then( () => {
            console.log(`Copied all challengeMembers from ${PROD} to ${BACK}`);
        }).catch(err => {
            console.error(`error updating challengeMembers: ${err}`);
        });
    
        console.log(`Copying challengeActivities from ${PROD} to ${BACK} ...`)
        dbProdActivitiesRef.get().then(snap => {
            snap.forEach(doc => {
                let docData = doc.data();
                dbBackActivitiesRef.doc(doc.id).set(docData).then(newDoc => {
                    return;
                });
            });
        }).then( () => {
            console.log(`Copied all challengeActivities from ${PROD} to ${BACK}`);
        }).catch(err => {
            console.error(`error updating challengeActivities: ${err}`);
        });
    
        console.log(`Copying teams from ${PROD} to ${BACK} ...`)
        dbProdTeamsRef.get().then(snap => {
            snap.forEach(doc => {
                let docData = doc.data();
                dbBackTeamsRef.doc(doc.id).set(docData).then(newDoc => {
                    return;
                });
            });
        }).then( () => {
            console.log(`Copied all teams from ${PROD} to ${BACK}`);
        }).catch(err => {
            console.error(`error updating teams: ${err}`);
        });
    }

    static async copyProdToBack() {        
        const dbProdRefs = Util.getDynamicDBRefs(PROD);
        const dbProdUsersRef = dbProdRefs.dbUsersRef;
        const dbProdATCMembersRef = dbProdRefs.dbATCMembersRef;
        const dbProdChallengesRef = dbProdRefs.dbChallengesRef;

        const dbBackRefs = Util.getDynamicDBRefs(BACK);
        const dbBackUsersRef = dbBackRefs.dbUsersRef;
        const dbBackATCMembersRef = dbBackRefs.dbATCMembersRef;
        const dbBackChallengesRef = dbBackRefs.dbChallengesRef;
    
        console.log(`Copying users from ${PROD} to ${BACK} ...`);
        dbProdUsersRef.get().then(snap => {
            snap.forEach(doc => {
                let docData = doc.data();
                dbBackUsersRef.doc(doc.id).set(docData).then(newDoc => {
                    return;
                });
            });
        }).then( () => {
            console.log(`Copied all users from ${PROD} to ${BACK}`);
        }).catch(err => {
            console.error(`error updating user: ${err}`);
        });
    
        console.log(`Copying ATCMembers from ${PROD} to ${BACK} ...`);
        dbProdATCMembersRef.get().then(snap => {
            snap.forEach(doc => {
                let docData = doc.data();
                dbBackATCMembersRef.doc(doc.id).set(docData).then(newDoc => {
                    return;
                });
            });
        }).then( () => {
            console.log(`Copied all ATCMembers from ${PROD} to ${BACK}`);
        }).catch(err => {
            console.error(`error updating ATCMembers: ${err}`);
        });
    
        console.log(`Copying challenges from ${PROD} to ${BACK} ...`)
        dbProdChallengesRef.get().then(snap => {
            snap.forEach(doc => {
                let docData = doc.data();
                dbBackChallengesRef.doc(doc.id).set(docData).then(newDoc => {
                    console.log(`Copying challenge: ${doc.id}`);
                    Backup.copyChallengeProdToBack(doc.id);
                    return;
                });
            });
        }).then( () => {
            console.log(`Copied all Challenges from ${PROD} to ${BACK}`);
        }).catch(err => {
            console.error(`error updating Challenges: ${err}`);
        });
    }
    
    static async copyDevUsersToProd() {
        const dbDevUsersRef = dbALLRefs.dbDevUsersRef;
        
        const dbProdUsersRef = dbALLRefs.dbProdUsersRef;
    
        console.log(`Copying users from ${DEV} to ${PROD} ...`);
        dbDevUsersRef.get().then(snap => {
            snap.forEach(doc => {
                let docData = doc.data();
                dbProdUsersRef.doc(doc.id).set(docData).then(newDoc => {
                    return;
                });
            });
        }).then( () => {
            console.log(`Copied all users from ${DEV} to ${PROD}`);
        }).catch(err => {
            console.error(`error updating user: ${err}`);
        });
    
    }
    
    static async copyProdUsersToDev() {
        const dbDevUsersRef = dbALLRefs.dbDevUsersRef;
        
        const dbProdUsersRef = dbALLRefs.dbProdUsersRef;
    
        console.log(`Copying users from ${DEV} to ${PROD} ...`);
        dbProdUsersRef.get().then(snap => {
            snap.forEach(doc => {
                let docData = doc.data();
                dbDevUsersRef.doc(doc.id).set(docData).then(newDoc => {
                    return;
                });
            });
        }).then( () => {
            console.log(`Copied all users from ${DEV} to ${PROD}`);
        }).catch(err => {
            console.error(`error updating user: ${err}`);
        });
    
    }
    

}
module.exports = Backup;
