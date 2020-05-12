import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { envSet, APP_CONFIG } from "./modules/FirebaseEnvironment";
admin.initializeApp(functions.config().firebase);

import { Leaderboard } from "./modules/Leaderboard";
// import { Activity } from "./modules/interfaces/Activity";
// import { Result } from "./modules/interfaces/Result";
import { Challenge } from "./modules/interfaces/Challenge";
import { AllResults } from './modules/Interfaces/Result.Types';
import { Activity } from './modules/interfaces/Activity';
import { User } from "./modules/Interfaces/User";
import { UserDB } from "./modules/db/UserDB";

// exports.scheduledFunction = functions.pubsub.schedule('every 60 minutes').onRun((context) => {
//     console.log('Recalculate totals will be run every 60 minutes!');
//     const leaderboard:Leaderboard = new Leaderboard();
//     leaderboard.calculateLeaderboards().then(() => {
//         console.log(`completed calculating leaderboards`);
//     }).catch((err: Error) => {
//         console.error(err);
//     });

//     return null;
// });

// Listen for changes in all documents in the 'challengs' collection and all subcollections
exports.listenAllActivityUpdates = functions.firestore
    .document(`${APP_CONFIG.ORG}/${APP_CONFIG.ENV}/challenges/{challengeUid}/{activityCollectionId}/{activityId}`)
    .onWrite((change, context) => {
        // If we set `/challenges/challengeid/actitivies/134` to {body: "ride"} then
        console.log(`context.params.challengeUid == "${context.params.challengeUid}"`);
        console.log(`context.params.activityCollectionId == "${context.params.activityCollectionId}"`);
        console.log(`context.params.activityId == "${context.params.activityId}"`);

        const leaderboard:Leaderboard = new Leaderboard();
        const challenge = new Challenge(context.params.challengeUid);

        // Get an object with the current document value.
        // If the document does not exist, it has been deleted.
        const document:FirebaseFirestore.DocumentData = change.after.exists ? change.after.data() : null;
        // Get an object with the previous document value (for update or delete)
        const oldDocument:FirebaseFirestore.DocumentData = change.before.exists ? change.before.data() : null;
        const oldDocumentId = change.before.exists ? change.before.id : "";
        if (document === null) {
            // deleted - 
            const deletedActivity:Activity = oldDocument as Activity;
            console.log(`Deleted Actvity`);
            console.log(deletedActivity);
        } else {
            if (oldDocument === null) {
                // created - 
                const createdActivity:Activity = document as Activity;
                console.log(`Created Actvity`);
                leaderboard.calculateNewResults(challenge, createdActivity).then((allResults:AllResults) => {
                    console.log(`New Overall Number of Activitis: ${allResults.overallResults.nbrActivities}`);
                }).catch((err: Error) => {
                    const error = new Error(`Error ${err} in leaderboard.calculateNewResults for challnge : ${challenge.id}, index.ts, line: 60`);
                    console.error(error);
                }); 
            } else { 
                // Updated - 
                const oldActivity:Activity = oldDocument as Activity;
                oldActivity.id = oldDocumentId; 
                const updatedActivity:Activity = document as Activity;
                updatedActivity.id = oldDocumentId; 
                // Note - ONLY update activity totals if distance, duration etc fields have changed
                if ((oldActivity.distance !== updatedActivity.distance) || (oldActivity.duration !== updatedActivity.duration)) {
                    console.log(`Modified Actvity - old`);
                    // console.log(oldActivity);   
                    console.log(`Modified Actvity - new`);
                    // console.log(updatedActivity);   
                } else {
                    console.log(`Distance / duration did not change - no need to reclc totals`);
                }
            }
        }
    return 0;
});

exports.getChallengeResults = functions.https.onCall((req:any, context:any):any => {
    return new Promise((resolve, reject) => {
        const challenge = new Challenge(req.challengeUid);
        const leaderboard: Leaderboard = new Leaderboard();
        leaderboard.getResults(challenge).then((allResults:AllResults) => {
            // console.log(`Overall nbrActivities: ${allResults.overallResults.nbrActivities}`);
            // console.log(`Overall distance: ${allResults.overallResults.distanceTotal}`);
            // console.log(`Overall pointsTotal: ${allResults.overallResults.pointsTotal}`);
            // console.log(`Overall durationTotal: ${allResults.overallResults.durationTotal}`);
            resolve(allResults);
        }).catch(err => {
            reject(err);
        });   
    });//promise
});

exports.setEnviromentFromClient = functions.https.onCall((environment, context) => {
    // console.log(`called setEnviromentFromClient with environment ${JSON.stringify(environment)}`)
    envSet(environment.org, environment.env, environment.challengeUid);
    
    console.log(`Saved environment ${APP_CONFIG.ORG}, ${APP_CONFIG.ENV}, ${APP_CONFIG.CHALLENGEUID}`);
    return {message: `Saved environment ${APP_CONFIG.ORG}, ${APP_CONFIG.ENV}, ${APP_CONFIG.CHALLENGEUID}`};
});

// ===============================================================================================
// Strava module functions
// --------------------------
// I did oauth function using expores since it was the simplest (maybe only) way
// to do a simple redirect to the strava auth page vs using gets etc,
// ===============================================================================================
const strava = require('./modules/strava.js');
exports.oauth = strava.oauth;
exports.stravaGetToken = strava.stravaGetToken;
exports.stravaRefreshToken = strava.stravaRefreshToken;
exports.stravaDeauthorize = strava.stravaDeauthorize;
exports.stravaGetActivities = strava.stravaGetActivities;

exports.testFunctions = functions.https.onCall((req, res) => {
    console.log(`called testFunction with req ${JSON.stringify(req)}`)
    return {message: "response OK"};
});

// ===============================================================================================
// Auth module functions
// --------------------------
// firebase auth user stuff
// ===============================================================================================
const auth = require('./modules/auth.js');
exports.authDeleteUser = auth.authDeleteUser;
exports.authCreateUser = auth.authCreateUser;

// ===============================================================================================
// Webhooks module functions
// --------------------------
// ===============================================================================================
const webhook = require('./modules/webhook.js');
exports.webhook = webhook.strava;

// ===============================================================================================
// User Batch Updates from denormalizaion
// ===============================================================================================
// Listen for changes in users
exports.listenUserUpdates = functions.firestore
    .document(`${APP_CONFIG.ORG}/${APP_CONFIG.ENV}/users/{userId}`)
    .onUpdate((change: functions.Change<functions.firestore.DocumentSnapshot>, context: functions.EventContext) => {
        console.log(`listenUserUpdates for userId (context.params.userId) == ${context.params.userId}`);

        const document:FirebaseFirestore.DocumentData = change.after.exists ? change.after.data() : null;
        const documentId = context.params.userId;

        const newUser = document as User;
        // console.log(`listenUserUpdates displayName == ${newUser.displayName}`);
        newUser.uid = documentId;
        newUser.displayName = newUser.firstName + " " + newUser.lastName;
        const userDB = new UserDB();
        userDB.updateUserActivityDisplayNameWithUser(newUser).then(() => {
            return true;
        }).catch((err: Error) => {
            console.error(err);    
            return false;
        });   

    return 0;
});

// This allows the change to be initiated from client with just the uid (id) for the user
exports.updateUserActivityDisplayName = functions.https.onCall((req, context: functions.https.CallableContext) => {
    const userDB = new UserDB();
    userDB.updateUserActivityDisplayNameWithUid(req.userId).then(() => {
        return true;
    }).catch(err => {
        return false;
    });   
    return;
});

// ===============================================================================================
// Strava module functions
// --------------------------
// I did oauth function using expores since it was the simplest (maybe only) way
// to do a simple redirect to the strava auth page vs using gets etc,
// ===============================================================================================

exports.fBFupdateTeam = functions.https.onCall((req, res) => {
    // console.log(`In fBFupdateTeam with: req ${JSON.stringify(req)}`);

    const team = req.team;

    // console.log(`In fBFupdateTeam with: ORG: ${APP_CONFIG.ORG}, ENV: ${APP_CONFIG.ENV}, challengeUid: ${challengeUid}`);
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
    
});

exports.fBFupdateActivityTeamName = functions.https.onCall((req, res) => {
    // console.log(`In fBFupdateActivityTeamName with: req ${JSON.stringify(req)}`);

    const challengeUid = req.challengeUid;
    const team = req.team;

    // console.log(`In fBFupdateActivityTeamName with: ORG: ${APP_CONFIG.ORG}, ENV: ${APP_CONFIG.ENV}, challengeUid: ${challengeUid}`);
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
    
});