import * as admin from 'firebase-admin';
import { APP_CONFIG } from "./FirebaseEnvironment";
import { Team } from "./interfaces/Team";
import { Challenge } from './interfaces/Challenge';
import { Activity } from './interfaces/Activity';

// ===============================================================================================
// Update Team info that was denormalized
// ===============================================================================================
class TeamUpdate {
    // console.log(`In fBFupdateTeam with: req ${JSON.stringify(req)}`);
    public updateUserTeam(team: Team) {
        return new Promise((resolve, reject) => {
            const dbUsersRef = admin.firestore().collection(APP_CONFIG.ORG).doc(APP_CONFIG.ENV).collection("users");

            const batch = admin.firestore().batch();
            const allUsersOnTeamRef = dbUsersRef.where("teamUid", "==", team.id)
            allUsersOnTeamRef.get().then((querySnapshot) => {
                querySnapshot.forEach(doc => {
                    batch.set(doc.ref, {
                        teamName: team.name,
                    }, { merge: true });
                });
                return batch.commit();
            }).then(() => {
                console.log("Update Team Batch successfully committed!");
                resolve();
            }).catch((err) =>{
                console.error("Team Batch failed: ", err);
                reject(err);
            });
        }); // Promise
    }

    public updateActivityTeamName(team:Team, challengeId: string) {
    // console.log(`In fBFupdateActivityTeamName with: req ${JSON.stringify(req)}`);
        const challengeUid = challengeId;

        return new Promise((resolve, reject) => {
            let activitiesRef = undefined;
            if (challengeUid && challengeUid !== "") {
                activitiesRef = admin.firestore().collection(APP_CONFIG.ORG).doc(APP_CONFIG.ENV).collection("challenges").doc(challengeUid).collection(`activities`);
            }

            const batch = admin.firestore().batch();
            const allActivitiessOnTeamRef = activitiesRef.where("teamUid", "==", team.id)
            allActivitiessOnTeamRef.get().then((querySnapshot) => {
                querySnapshot.forEach(doc => {
                    batch.set(doc.ref, {
                        teamName: team.name,
                    }, { merge: true });
                });
                return batch.commit();
            }).then(() => {
                console.log("Activity Team Batch successfully committed!");
                resolve();
            }).catch((err) =>{
                console.error("Activity Team Batch failed: ", err);
                reject(err);
            });
        }); // Promise
    }


    public deleteActvitiesPastChallengeEnd(challenge: Challenge) {
        const challengeUid = challenge.id;

        return new Promise(async (resolve, reject) => {
            // first get the challenge so we ca get date since it doesnt get passed correctly
            let myChallenge: Challenge;

            try {
                const challengeRef = admin.firestore().collection(APP_CONFIG.ORG).doc(APP_CONFIG.ENV).collection("challenges").doc(challengeUid);
                const doc = await challengeRef.get();
                if (doc.data()) {
                    myChallenge = new Challenge();
                    myChallenge = doc.data() as Challenge;
                    myChallenge.id = doc.id;

                    console.log(`Deleting activities for challenge ${myChallenge}`);
                } else {
                    console.error(`error retrieving challenge for id: ${challengeUid}`);
                    reject(`error retrieving challenge for id: ${challengeUid}`);
                }

            } catch (err) {
                console.error(`error retrieving challenge for id: ${challengeUid}`);
                reject(`error retrieving challenge for id: ${challengeUid}`);
            }
            
            let activitiesRef = undefined;
            if (challengeUid && challengeUid !== "") {
                activitiesRef = admin.firestore().collection(APP_CONFIG.ORG).doc(APP_CONFIG.ENV).collection("challenges").doc(challengeUid).collection(`activities`);
            }

            const batch = admin.firestore().batch();
            const dbRef = activitiesRef.where("activityDateTime", ">", myChallenge.endDate);
            dbRef.get().then((querySnapshot) => {
                let batchCount: number = 0;
                const BreakException = {};
                try {
                    querySnapshot.forEach(doc => {
                        // Can only delete 500 at a time
                        if (batchCount > 498) {
                            throw BreakException;
                        }
                        // console.log(`Deleting activitiy with id: ${doc.id}`);
                        batch.delete(doc.ref);
                        batchCount += 1;
                    });
                } catch (e) {
                    if (e !== BreakException) throw e;
                    // All is just fine
                }
                return batch.commit();
            }).then(() => {
                console.log("Activity Batch delete successfully committed!");
                resolve();
            }).catch((err) =>{
                console.error("Activity Batch delete failed: ", err);
                reject(err);
            });
        }); // Promise
    }

    public updateBlankActivityTeamName(challengeId: string) {
        return new Promise(async (resolve, reject) => {
            const dbActivitiesRef = admin.firestore().collection(APP_CONFIG.ORG).doc(APP_CONFIG.ENV).collection("challenges").doc(challengeId).collection(`activities`);
            
            this.mergeActivitiesWithUsers(challengeId).then(activities => {
                // console.log(`Activities after merge: ${activities}`);

                // loop through nd update all activities
                const batch = admin.firestore().batch();
                for (const activity of activities) {
                    // console.log(activity);
                    const dbRef = dbActivitiesRef.doc(activity.id);
                    batch.set(dbRef, activity);
                }
                return batch.commit();
            }).then(() => {
                console.log("Activity Batch team update blank teams successfully committed!");
                resolve();
            }).catch(err => {
                reject(err);
            })
        }); // Promise
    }

     public mergeActivitiesWithUsers(challengeId: string): Promise<Activity[]> {
        const challengeUid = challengeId;
        
        // its a promise so return
        return new Promise((resolve, reject) => {
            let activitiesRef = undefined;
            if (challengeUid && challengeUid !== "") {
                activitiesRef = admin.firestore().collection(APP_CONFIG.ORG).doc(APP_CONFIG.ENV).collection("challenges").doc(challengeUid).collection(`activities`);
            }
            
            const activities = Array<Activity>();

            const allActivitiessOnTeamRef = activitiesRef.where("teamName", "==", "");
            allActivitiessOnTeamRef.get().then((querySnapshot) => {
                const activityQueries:any = [];
                querySnapshot.forEach(doc => {
                    const newDoc = doc.data();
                    newDoc.id = doc.id;

                    const activity: Activity = newDoc as Activity;

                    // get the user doc.data().uid;
                    const userRef = admin.firestore().collection(APP_CONFIG.ORG).doc(APP_CONFIG.ENV).collection("users").doc(activity.uid);
                    const userQuery = userRef.get().then (userDoc => {
                        if (userDoc.exists) {
                            activity.teamName = userDoc.data().teamName;
                            activity.teamUid = userDoc.data().teamUid;
                        }
                    }).catch((err: Error) => {
                        console.error(`Error refPromiseAll.userQuery: ${err}`);
                    }).finally(() => {
                        activities.push(activity);
                    });
                    activityQueries.push(userQuery);
                });
                // This waits until ALL promises in the activityQueries array are resolved
                Promise.all(activityQueries).then(() => {
                    resolve(activities);
                }).catch((err2:Error) => {
                    reject(err2);
                });
            }).catch(err => {
                reject(`Error mergeActivitiesWithUsers ${err.message}`);
            });
        });
    }

} // Class

export { TeamUpdate };