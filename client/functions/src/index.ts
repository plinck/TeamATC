import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { envSet, APP_CONFIG } from "./modules/FirebaseEnvironment";
admin.initializeApp(functions.config().firebase);

import { Leaderboard } from "./modules/Leaderboard";
// import { Activity } from "./modules/interfaces/Activity";
// import { Result } from "./modules/interfaces/Result";
import { Challenge } from "./modules/interfaces/Challenge";
import { AllResults } from './modules/Interfaces/Result.Types';
// const hardCodedChallengeUid = "5XuThS03PcQQ1IasPQif";

exports.scheduledFunction = functions.pubsub.schedule('every 60 minutes').onRun((context) => {
    console.log('Recalculate totals will be run every 60 minutes!');
    const leaderboard:Leaderboard = new Leaderboard();
    leaderboard.calculateLeaderboards().then(() => {
        console.log(`completed calculating leaderboards`);
    }).catch((err: Error) => {
        console.error(err);
    });

    return null;
});

// exports.listenForCreateActivity = functions.firestore
//     .document(`${APP_CONFIG.ORG}/${APP_CONFIG.ENV}/challenges/${hardCodedChallengeUid}/activities/{activityId}`)
//     .onCreate((doc, context) => {
//         // Get an object representing the document
//         // e.g. {'name': 'Marie', 'age': 66}
//         const docData:FirebaseFirestore.DocumentData = doc.data();
//         docData.id = doc.id;
//         docData.activityDateTime = docData.activityDateTime.toDate();
//         const newActivity:Activity = docData as Activity;
//         console.log(`new activity: ${newActivity}`);

//         const leaderboard:Leaderboard = new Leaderboard();
//         const challenge = new Challenge(hardCodedChallengeUid);
//         leaderboard.calulateNewResults(challenge, newActivity);
    
//         return true;
// });

exports.getChallengeResults = functions.https.onCall((req:any, context:any):any => {
    return new Promise((resolve, reject) => {
        const challenge = new Challenge(req.challengeUid);
        Leaderboard.listenForActivityUpdates(challenge).then ((res: Boolean) => {
            const allResults:AllResults = Leaderboard.getResults(challenge);
            console.log(`Overall nbrActivities: ${allResults.overallResults.nbrActivities}`);
            console.log(`Overall distance: ${allResults.overallResults.distanceTotal}`);
            console.log(`Overall pointsTotal: ${allResults.overallResults.pointsTotal}`);
            console.log(`Overall durationTotal: ${allResults.overallResults.durationTotal}`);
            resolve(allResults);
        }).catch((err2: Error) => {
            resolve(err2);
        });
    });//promise
});

exports.setEnviromentFromClient = functions.https.onCall((environment, context) => {
    console.log(`called setEnviromentFromClient with environment ${JSON.stringify(environment)}`)
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
// Strava module functions
// --------------------------
// I did oauth function using expores since it was the simplest (maybe only) way
// to do a simple redirect to the strava auth page vs using gets etc,
// ===============================================================================================

exports.fBFupdateTeam = functions.https.onCall((req, res) => {
    console.log(`In fBFupdateTeam with: req ${JSON.stringify(req)}`);

    const challengeUid = req.challengeUid;
    const team = req.team;

    console.log(`In fBFupdateTeam with: ORG: ${APP_CONFIG.ORG}, ENV: ${APP_CONFIG.ENV}, challengeUid: ${challengeUid}`);
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
            console.log("Batch successfully committed!");
            resolve();
        }).catch((err) =>{
            console.error("Batch failed: ", err);
            reject(err);
        });

    }); // Promise
    
});

exports.fBFupdateActivityTeamName = functions.https.onCall((req, res) => {
    console.log(`In fBFupdateActivityTeamName with: req ${JSON.stringify(req)}`);

    const challengeUid = req.challengeUid;
    const team = req.team;

    console.log(`In fBFupdateActivityTeamName with: ORG: ${APP_CONFIG.ORG}, ENV: ${APP_CONFIG.ENV}, challengeUid: ${challengeUid}`);
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
            console.log("Batch successfully committed!");
            resolve();
        }).catch((err) =>{
            console.error("Batch failed: ", err);
            reject(err);
        });

    }); // Promise
    
});