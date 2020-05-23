import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { envSet, APP_CONFIG } from "./modules/FirebaseEnvironment";
admin.initializeApp(functions.config().firebase);

import { TeamUpdate } from "./modules/TeamUpdate";
import { Leaderboard } from "./modules/Leaderboard";
import { Team } from "./modules/interfaces/Team";
// import { Result } from "./modules/interfaces/Result";
import { Challenge } from "./modules/interfaces/Challenge";
import { AllResults } from './modules/interfaces/Result.Types';
import { Activity } from './modules/interfaces/Activity';
import { User } from "./modules/interfaces/User";
import { UserDB } from "./modules/db/UserDB";
import { ActivityUpdateType } from "./modules/interfaces/Common.Types";
import { StravaEvent, IncomingStravaEventType } from './modules/interfaces/StravaEvent';
import { saveStravaEvent } from "./modules/events";
import { StravaEventDB } from "./modules/db/StravaEventDB";
import { DistanceMatrix } from "./modules/DistanceMatrix";

// exports.scheduledFunction = functions.pubsub.schedule('5 6 * * *').onRun((context) => {
//     console.log('This will be run every day at 6:05 AM UTC!');
//     const leaderboard:Leaderboard = new Leaderboard();
//     leaderboard.calculateLeaderboards().then(() => {
//         console.log(`completed calculating leaderboards`);
//     }).catch((err: Error) => {
//         console.error(err);
//     });

//     return null;
// });

// Allow Admin to force recalc of totals froom client in case its out of whack
exports.forceRecalculation = functions.https.onCall((req:any, context:any):any => {
    console.log('Recalculatng totals triggered ...');
    const challenge:Challenge = new Challenge(req.challengeUid);
    const leaderboard:Leaderboard = new Leaderboard();
    return leaderboard.calculateLeaderboards(challenge).then(() => {
        console.log(`completed calculating leaderboards`);
    }).catch((err: Error) => {
        console.error(err);
    });
});

// Listen for changes in all documents in the 'challengs' collection and all subcollections
exports.listenAllActivityUpdates = functions.firestore
    .document(`${APP_CONFIG.ORG}/${APP_CONFIG.ENV}/challenges/{challengeUid}/activities/{activityId}`)
    .onWrite((change, context) => {
        return new Promise((resolve, reject) => {
            // If we set `/challenges/challengeid/actitivies/134` to {body: "ride"} then
            console.log(`context.params.challengeUid == ${context.params.challengeUid}`);

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
                leaderboard.calculateNewResults(challenge, deletedActivity, ActivityUpdateType.delete).then((allResults:AllResults) => {
                    console.log(`New Overall Number of Activitis: ${allResults.overallResults.nbrActivities}`);
                    resolve();
                }).catch((err: Error) => {
                    const error = new Error(`Error ${err} in leaderboard.calculateNewResults for challnge : ${challenge.id}, index.ts, line: 65`);
                    console.error(error);
                    reject(error);
                }); 
            } else {
                if (oldDocument === null) {
                    // created - 
                    const createdActivity:Activity = document as Activity;
                    console.log(`Created Actvity`);
                    leaderboard.calculateNewResults(challenge, createdActivity, ActivityUpdateType.create).then((allResults:AllResults) => {
                        console.log(`New Overall Number of Activitis: ${allResults.overallResults.nbrActivities}`);
                        resolve();
                    }).catch((err: Error) => {
                        const error = new Error(`Error ${err} in leaderboard.calculateNewResults for challnge : ${challenge.id}, index.ts, line: 76`);
                        console.error(error);
                        reject(error);
                    }); 
                } else { 
                    // Updated - 
                    const oldActivity:Activity = oldDocument as Activity;
                    oldActivity.id = oldDocumentId; 
                    const updatedActivity:Activity = document as Activity;
                    updatedActivity.id = oldDocumentId; 
                    // Note - ONLY update activity totals if distance, duration etc fields have changed
                    if ((oldActivity.distance !== updatedActivity.distance) || (oldActivity.duration !== updatedActivity.duration)) {
                        console.log(`Modified Actvity`);

                        // Calculate the net change between the new and the old activity
                        const netActivity = updatedActivity;
                        netActivity.distance = updatedActivity.distance - oldActivity.distance;
                        netActivity.duration = updatedActivity.duration - oldActivity.duration;

                        leaderboard.calculateNewResults(challenge, netActivity, ActivityUpdateType.update).then((allResults:AllResults) => {
                            console.log(`New Overall Number of Activitis: ${allResults.overallResults.nbrActivities}`);
                            resolve();
                        }).catch((err: Error) => {
                            const error = new Error(`Error ${err} in leaderboard.calculateNewResults for challnge : ${challenge.id}, index.ts, line: 97`);
                            console.error(error);
                            reject(error);
                        }); 
                    } else {
                        console.log(`Distance / duration did not change - no need to reclc totals`);
                        resolve();
                    }
                }
            }
        }); // Promise
});

// Listen for changes in stravaevents
exports.listenStravaEvents = functions.firestore
    .document(`${APP_CONFIG.ORG}/${APP_CONFIG.ENV}/stravaevents/{stravaEventId}`)
    .onWrite((change, context) => {
        return new Promise((resolve, reject) => {
            console.log(`context.params.stravaEventId == ${context.params.stravaEventId}`);
            const stravaEventId = context.params.stravaEventId;

            const document:FirebaseFirestore.DocumentData = change.after.exists ? change.after.data() : null;
            if (document === null) {
                // deleted - ignore
                resolve();
            } else {
                // created or updated - 
                const createdEvent:StravaEvent = document as StravaEvent;
                console.log(`Created Event`);
                if (createdEvent.aspect_type === "create") {
                    // Save as activity and then delete
                    const event: IncomingStravaEventType = createdEvent as IncomingStravaEventType;
                    saveStravaEvent(event).then(() => {
                        console.log(`Saved activity ...`);
                        return;
                    }).then(() => {
                        const stravaEventDB: StravaEventDB = new StravaEventDB();
                        stravaEventDB.delete(stravaEventId).then((savedEvent:StravaEvent) => {
                            console.log(`Success deleting event`);
                            resolve();
                        }).catch(err2 => {
                            console.log(`Error ${err2} deleting event`);
                            reject(err2);
                        });                        
                    }).catch(err => {
                        reject(err);
                    });
                } else {
                    // just delete it
                    const stravaEventDB: StravaEventDB = new StravaEventDB();
                    stravaEventDB.delete(stravaEventId).then((savedEvent:StravaEvent) => {
                        console.log(`Success deleting event`);
                        resolve();
                    }).catch(err3 => {
                        console.log(`Error ${err3} deleting event`);
                        reject(err3);
                    });                        
                }
            }
        }); // Promise
});


// Get all resuls for challenge
exports.getChallengeResults = functions.https.onCall((req:any, context:any):any => {
    return new Promise((resolve, reject) => {
        const challenge = new Challenge(req.challengeUid);
        const leaderboard: Leaderboard = new Leaderboard();
        leaderboard.getResults(challenge).then((allResults:AllResults) => {
            resolve(allResults);
        }).catch(err => {
            reject(err);
        });   
    });//promise
});

exports.setEnviromentFromClient = functions.https.onCall((environment, context) => {
    // console.log(`called setEnviromentFromClient with environment ${JSON.stringify(environment)}`)
    envSet(environment.org, environment.env, environment.challengeUid);
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
        return new Promise<any>((resolve:any, reject:any) => {
            console.log(`listenUserUpdates for userId (context.params.userId) == ${context.params.userId}`);

            const documentOld:FirebaseFirestore.DocumentData = change.before.exists ? change.before.data() : null;
            const document:FirebaseFirestore.DocumentData = change.after.exists ? change.after.data() : null;
            const documentId = context.params.userId;

            const oldUser = documentOld ? documentOld as User : null;
            const newUser = document as User;
            // console.log(`listenUserUpdates displayName == ${newUser.displayName}`);
            // Only Update if old exists and name changed
            if (!oldUser || newUser.firstName !== oldUser.firstName || newUser.lastName !== oldUser.lastName) {
                newUser.uid = documentId;
                newUser.displayName = newUser.firstName + " " + newUser.lastName;
                const userDB = new UserDB();
                userDB.updateUserActivityDisplayNameWithUser(newUser).then(() => {
                    resolve(true);
                }).catch((err: Error) => {
                    console.error(err);    
                    reject(err);
                });   
            }
            resolve(true);
        }); //Promise
});

// ===============================================================================================
// Update Teams SECTION
// ===============================================================================================
// This allows the change to be initiated from client with just the uid (id) for the user
exports.updateUserActivityDisplayName = functions.https.onCall((req, context: functions.https.CallableContext) => {
    return new Promise<any>((resolve:any, reject:any) => {
        const userDB = new UserDB();
        userDB.updateUserActivityDisplayNameWithUid(req.userId).then(() => {
            resolve(true);
        }).catch(err => {
            reject(err);
        });   
    });//Promise
});

// Get distanxe from google
exports.calcDistanceMatrix = functions.https.onCall((req, context: functions.https.CallableContext) => {
    console.log("calcDistanceMatrix");
    console.log(req);
    const distanceMatrix = new DistanceMatrix();
    const travelMode =  req.travelMode ? req.travelMode : "DRIVING";
    return distanceMatrix.calcDistanceMatrix(req.origins, req.destinations, travelMode)
});

// Update Teams - module functions
exports.fBFupdateTeam = functions.https.onCall((req, context: functions.https.CallableContext) => {
    return new Promise<any>((resolve:any, reject:any) => {
        const team:Team = req.team as Team;
        const teamUpdate = new TeamUpdate();
        teamUpdate.updateUserTeam(team).then(() => {
            resolve(true);
        }).catch((err: Error) => {
            reject(err);
        });   
    });//Promise
});

exports.fBFupdateActivityTeamName = functions.https.onCall((req, context: functions.https.CallableContext) => {
    return new Promise<any>((resolve:any, reject:any) => {
        const challengeUid = req.challengeUid;
        const team:Team = req.team as Team;
        const teamUpdate = new TeamUpdate();
        teamUpdate.updateActivityTeamName(team, challengeUid).then(() => {
            resolve(true);
        }).catch((err: Error) => {
            reject(err);
        });   
    });//Promise
});