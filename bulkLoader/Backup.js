const Util = require("./Util.js");

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
    
        console.log("Copying users from dev to prod ...")
        dbDevUsersRef.get().then(snap => {
            snap.forEach(doc => {
                let docData = doc.data();
                dbProdUsersRef.doc(doc.id).set(docData).then(newDoc => {
                    return;
                });
            });
        }).then( () => {
            console.log(`Copied all users from dev to prod`);
        }).catch(err => {
            console.error(`error updating user: ${err}`);
        });
    
        console.log("Copying ATCMembers from dev to prod ...")
        dbDevATCMembersRef.get().then(snap => {
            snap.forEach(doc => {
                let docData = doc.data();
                dbProdATCMembersRef.doc(doc.id).set(docData).then(newDoc => {
                    return;
                });
            });
        }).then( () => {
            console.log(`Copied all ATCMembers from dev to prod`);
        }).catch(err => {
            console.error(`error updating ATCMembers: ${err}`);
        });
    
        console.log("Copying challenges from dev to prod ...")
        dbDevChallengesRef.get().then(snap => {
            snap.forEach(doc => {
                let docData = doc.data();
                dbProdChallengesRef.doc(doc.id).set(docData).then(newDoc => {
                    return;
                });
            });
        }).then( () => {
            console.log(`Copied all Challenges from dev to prod`);
        }).catch(err => {
            console.error(`error updating Challenges: ${err}`);
        });
    
        console.log("Copying challengeMembers from dev to prod ...")
        dbDevATCChallengeMemberRef.get().then(snap => {
            snap.forEach(doc => {
                let docData = doc.data();
                dbProdATCChallengeMemberRef.doc(doc.id).set(docData).then(newDoc => {
                    return;
                });
            });
        }).then( () => {
            console.log(`Copied all challengeMembers from dev to prod`);
        }).catch(err => {
            console.error(`error updating challengeMembers: ${err}`);
        });
    
        console.log("Copying challengeActivities from dev to prod ...")
        dbDevActivitiesRef.get().then(snap => {
            snap.forEach(doc => {
                let docData = doc.data();
                dbProdActivitiesRef.doc(doc.id).set(docData).then(newDoc => {
                    return;
                });
            });
        }).then( () => {
            console.log(`Copied all challengeActivities from dev to prod`);
        }).catch(err => {
            console.error(`error updating challengeActivities: ${err}`);
        });
    
        console.log("Copying teams from dev to prod ...")
        dbDevTeamsRef.get().then(snap => {
            snap.forEach(doc => {
                let docData = doc.data();
                dbProdTeamsRef.doc(doc.id).set(docData).then(newDoc => {
                    return;
                });
            });
        }).then( () => {
            console.log(`Copied all teams from dev to prod`);
        }).catch(err => {
            console.error(`error updating teams: ${err}`);
        });
    
    
    }

    static copyChallengeProdToBack(challengeUid) {
        const dbChallengeProdRefs = Util.getDynamicChallengeDBRefs("prod", challengeUid)
        const dbProdATCChallengeMemberRef = dbChallengeProdRefs.dbChallengeMembersRef;
        const dbProdActivitiesRef = dbChallengeProdRefs.dbActivitiesRef;
        const dbProdTeamsRef = dbChallengeProdRefs.dbTeamsRef;

        const dbChallengeBackRefs = Util.getDynamicChallengeDBRefs("back", challengeUid)
        const dbBackATCChallengeMemberRef = dbChallengeBackRefs.dbChallengeMembersRef;
        const dbBackActivitiesRef = dbChallengeBackRefs.dbActivitiesRef;
        const dbBackTeamsRef = dbChallengeBackRefs.dbTeamsRef;


        console.log("Copying challengeMembers from prod to back ...")
        dbProdATCChallengeMemberRef.get().then(snap => {
            snap.forEach(doc => {
                let docData = doc.data();
                dbBackATCChallengeMemberRef.doc(doc.id).set(docData).then(newDoc => {
                    return;
                });
            });
        }).then( () => {
            console.log(`Copied all challengeMembers from prod to back`);
        }).catch(err => {
            console.error(`error updating challengeMembers: ${err}`);
        });
    
        console.log("Copying challengeActivities from prod to back ...")
        dbProdActivitiesRef.get().then(snap => {
            snap.forEach(doc => {
                let docData = doc.data();
                dbBackActivitiesRef.doc(doc.id).set(docData).then(newDoc => {
                    return;
                });
            });
        }).then( () => {
            console.log(`Copied all challengeActivities from prod to back`);
        }).catch(err => {
            console.error(`error updating challengeActivities: ${err}`);
        });
    
        console.log("Copying teams from prod to back ...")
        dbProdTeamsRef.get().then(snap => {
            snap.forEach(doc => {
                let docData = doc.data();
                dbBackTeamsRef.doc(doc.id).set(docData).then(newDoc => {
                    return;
                });
            });
        }).then( () => {
            console.log(`Copied all teams from prod to back`);
        }).catch(err => {
            console.error(`error updating teams: ${err}`);
        });
    }

    static async copyProdToBack() {        
        const dbProdRefs = Util.getDynamicDBRefs("prod");
        const dbProdUsersRef = dbProdRefs.dbUsersRef;
        const dbProdATCMembersRef = dbProdRefs.dbATCMembersRef;
        const dbProdChallengesRef = dbProdRefs.dbChallengesRef;

        const dbBackRefs = Util.getDynamicDBRefs("back");
        const dbBackUsersRef = dbBackRefs.dbUsersRef;
        const dbBackATCMembersRef = dbBackRefs.dbATCMembersRef;
        const dbBackChallengesRef = dbBackRefs.dbChallengesRef;
    
        console.log("Copying users from prod to back ...")
        dbProdUsersRef.get().then(snap => {
            snap.forEach(doc => {
                let docData = doc.data();
                dbBackUsersRef.doc(doc.id).set(docData).then(newDoc => {
                    return;
                });
            });
        }).then( () => {
            console.log(`Copied all users from prod to back`);
        }).catch(err => {
            console.error(`error updating user: ${err}`);
        });
    
        console.log("Copying ATCMembers from prod to back ...")
        dbProdATCMembersRef.get().then(snap => {
            snap.forEach(doc => {
                let docData = doc.data();
                dbBackATCMembersRef.doc(doc.id).set(docData).then(newDoc => {
                    return;
                });
            });
        }).then( () => {
            console.log(`Copied all ATCMembers from prod to back`);
        }).catch(err => {
            console.error(`error updating ATCMembers: ${err}`);
        });
    
        console.log("Copying challenges from prod to back ...")
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
            console.log(`Copied all Challenges from prod to back`);
        }).catch(err => {
            console.error(`error updating Challenges: ${err}`);
        });
    }
    
    static async copyDevUsersToProd() {
        const dbDevUsersRef = dbALLRefs.dbDevUsersRef;
        
        const dbProdUsersRef = dbALLRefs.dbProdUsersRef;
    
        console.log("Copying users from dev to prod ...")
        dbDevUsersRef.get().then(snap => {
            snap.forEach(doc => {
                let docData = doc.data();
                dbProdUsersRef.doc(doc.id).set(docData).then(newDoc => {
                    return;
                });
            });
        }).then( () => {
            console.log(`Copied all users from dev to prod`);
        }).catch(err => {
            console.error(`error updating user: ${err}`);
        });
    
    }
    
    static async copyProdUsersToDev() {
        const dbDevUsersRef = dbALLRefs.dbDevUsersRef;
        
        const dbProdUsersRef = dbALLRefs.dbProdUsersRef;
    
        console.log("Copying users from dev to prod ...")
        dbProdUsersRef.get().then(snap => {
            snap.forEach(doc => {
                let docData = doc.data();
                dbDevUsersRef.doc(doc.id).set(docData).then(newDoc => {
                    return;
                });
            });
        }).then( () => {
            console.log(`Copied all users from dev to prod`);
        }).catch(err => {
            console.error(`error updating user: ${err}`);
        });
    
    }
    

}
module.exports = Backup;
