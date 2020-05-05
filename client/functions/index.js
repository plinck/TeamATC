const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

const { APP_CONFIG } = require("./modules/FirebaseEnvironment.js");
const challenge = {
    id : "5XuThS03PcQQ1IasPQif",
}

const CalculateLeaderboards = require("./modules/CalculateLeaderboards.js")
// Run the calculations in the background

exports.scheduledFunction = functions.pubsub.schedule('every 5 minutes').onRun((context) => {
    console.log('This will be run every 5 minutes!');
    const calculateLeaderboards = new CalculateLeaderboards();
    calculateLeaderboards.run();
    return null;
});

exports.listenForCreateActivity = functions.firestore
    .document(`${APP_CONFIG.ORG}/${APP_CONFIG.ENV}/challenges/${challenge.id}/activities/{activityId}`)
    .onCreate((snap, context) => {
        // Get an object representing the document
        // e.g. {'name': 'Marie', 'age': 66}
        let newActivity = {};
        newActivity = snap.data();
        newActivity.id = snap.id;
        newActivity.activityDateTime = newActivity.activityDateTime.toDate();
        console.log(`new activity: ${JSON.stringify(newActivity, null,2)}`);

        const calculateLeaderboards = new CalculateLeaderboards();
        calculateLeaderboards.calulateNewResults(challenge, newActivity);
    

        return true;
});

exports.setEnviromentFromClient = functions.https.onCall((environment, context) => {
    console.log(`called setEnviromentFromClient with environment ${JSON.stringify(environment)}`)
    set(environment.org, environment.env, environment.challengeUid);
    
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

    let challengeUid = req.challengeUid;
    let team = req.team;

    console.log(`In fBFupdateTeam with: ORG: ${APP_CONFIG.ORG}, ENV: ${APP_CONFIG.ENV}, challengeUid: ${challengeUid}`);
    return new Promise((resolve, reject) => {
        let activitiesRef = undefined;
        let dbUsersRef = admin.firestore().collection(APP_CONFIG.ORG).doc(APP_CONFIG.ENV).collection("users");
        if (challengeUid && challengeUid != "") {
            activitiesRef = admin.firestore().collection(APP_CONFIG.ORG).doc(APP_CONFIG.ENV).collection("challenges").doc(challengeUid).collection(`activities`);
        }

        let batch = admin.firestore().batch();
        let allUsersOnTeamRef = dbUsersRef.where("teamUid", "==", team.id)
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

    let challengeUid = req.challengeUid;
    let team = req.team;

    console.log(`In fBFupdateActivityTeamName with: ORG: ${APP_CONFIG.ORG}, ENV: ${APP_CONFIG.ENV}, challengeUid: ${challengeUid}`);
    return new Promise((resolve, reject) => {
        let activitiesRef = undefined;
        if (challengeUid && challengeUid != "") {
            activitiesRef = admin.firestore().collection(APP_CONFIG.ORG).doc(APP_CONFIG.ENV).collection("challenges").doc(challengeUid).collection(`activities`);
        }

        let batch = admin.firestore().batch();
        let allActivitiessOnTeamRef = activitiesRef.where("teamUid", "==", team.id)
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