const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

const ENV = require("./modules/FirebaseEnvironment.js");

exports.setEnviromentFromClient = functions.https.onCall((environment, context) => {
    console.log(`called setEnviromentFromClient with environment ${JSON.stringify(environment)}`)
    ENV.set(environment.org, environment.env, environment.challengeUid);
    
    console.log(`Saved environment ${ENV.APP_CONFIG.ORG}, ${ENV.APP_CONFIG.ENV}, ${ENV.APP_CONFIG.CHALLENGEUID}`);
    return {message: `Saved environment ${ENV.APP_CONFIG.ORG}, ${ENV.APP_CONFIG.ENV}, ${ENV.APP_CONFIG.CHALLENGEUID}`};
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

    console.log(`In fBFupdateTeam with: ORG: ${ENV.APP_CONFIG.ORG}, ENV: ${ENV.APP_CONFIG.ENV}, challengeUid: ${challengeUid}`);
    return new Promise((resolve, reject) => {
        let activitiesRef = undefined;
        let dbUsersRef = admin.firestore().collection(ENV.APP_CONFIG.ORG).doc(ENV.APP_CONFIG.ENV).collection("users");
        if (challengeUid && challengeUid != "") {
            activitiesRef = admin.firestore().collection(ENV.APP_CONFIG.ORG).doc(ENV.APP_CONFIG.ENV).collection("challenges").doc(challengeUid).collection(`activities`);
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

    console.log(`In fBFupdateActivityTeamName with: ORG: ${ENV.APP_CONFIG.ORG}, ENV: ${ENV.APP_CONFIG.ENV}, challengeUid: ${challengeUid}`);
    return new Promise((resolve, reject) => {
        let activitiesRef = undefined;
        if (challengeUid && challengeUid != "") {
            activitiesRef = admin.firestore().collection(ENV.APP_CONFIG.ORG).doc(ENV.APP_CONFIG.ENV).collection("challenges").doc(challengeUid).collection(`activities`);
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