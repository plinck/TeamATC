const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');
const cors = require('cors')({origin: true});
const express = require('express');

admin.initializeApp(functions.config().firebase);

let ORG="ATC"
let ENV="prod"
let CHALLENGEUID=""
// Get environment vars
const config = functions.config().env;

exports.setEnviromentFromClient = functions.https.onCall((environment, res) => {
    console.log(`called setEnviromentFromClient with environment ${JSON.stringify(environment)}`)
    console.log(`ORG ${(environment.org)}`)
    console.log(`ENV ${(environment.env)}`)
    console.log(`CHALLENGEUID ${(environment.challengeUid)}`)
    ORG=environment.org;
    ENV=environment.env;
    CHALLENGEUID=environment.challengeUid;    
    console.log(`saved environment with: ORG: ${ORG}, ENV: ${ENV}, CHALLENGEUID: ${CHALLENGEUID}`);
    return {message: "Saved environment OK"};
});

// I did these functions using expores since it was the simplest (maybe only) way
// to do a simple redirect to the strava auth page vs using gets etc,
const app = express();
app.get('/stravaauth', async (req, res) => {
    console.log(`called stravaSendAuthorizationRequest with environment ${req}`);
    
    const params = {
        client_id: config.strava.client_id,
        redirect_uri: "http://localhost:3000/oauthredirect",
        response_type: 'code',
        approval_prompt: "auto",
        scope: "activity:read_all",
        state: "STRAVA"
    };

    try {
        const URIRequest = "https://www.strava.com/oauth/authorize?" + 
        `client_id=${params.client_id}` +
        `&redirect_uri=${params.redirect_uri}` +
        `&response_type=${params.response_type}` +
        `&approval_prompt=${params.approval_prompt}` +
        `&scope=${params.scope}` +
        `&state=${params.state}`
        ;

        console.log(`Request to redirect: ${URIRequest}`);
        res.redirect(URIRequest);
        res.end(200);
    } catch (err) {
        console.error(`Error redirecting to URI: ${err}`);
        res.redirect(`${redirect_uri}?error=BadRequest`);
        return res.status(401).json(`Error Caught in OAuth server request: ${err}`);
    }

});
exports.oauth = functions.https.onRequest(app);

// This gets the token after the user has authorized the app to use strava
exports.stravaGetToken = functions.https.onCall((req, res) => {
    return new Promise((resolve, reject) => {
        console.log(`called stravaGetToken with request`);
        console.log(req);
        let code = undefined;
        if (req && req.code) {
            code = req.code;
        } else {
            return reject(`Error oin stravaGetToken - invalid parm - must provide code`);
        }

        const params = {
            client_id: config.strava.client_id,
            client_secret: config.strava.client_secret,
            code: code,
            grant_type: "authorization_code"
        };

        const URIRequest = "https://www.strava.com/oauth/token?" + 
            `client_id=${params.client_id}` +
            `&client_secret=${params.client_secret}` +
            `&code=${params.code}` +
            `&grant_type=${params.grant_type}`
            ;

        console.log(`URIRequest: ${URIRequest}`);
        axios.post(URIRequest).then((res) => {
            console.log("Successfully sent strava token request.  response info");
            // console.log(res.data.athlete);
            // console.log(res.data.refresh_token);
            // console.log(res.data.access_token);
            // console.log(res.data.athlete.profile);
            // console.log(res.data.athlete.firstname);
            // console.log(res.data.athlete.lastname);
            console.log(res.data);


            // MJUST break up response since FB functions can not resolve this complex
            // res object as it has circular reference.  It causes an error;
            // Unhandled error RangeError: Maximum call stack size exceeded
            const clientResponse = {
                refresh_token: res.data.refresh_token,
                access_token: res.data.access_token,
                expires_at: res.data.expires_at,
                expires_in: res.data.expires_in,
                athlete: res.data.athlete,
            }

            // NOW, save the strava info to the user account, maybe do in client
            // Must Save access_toke, refresh_token, expires_at, accepted_scopes

            return resolve(clientResponse);
        }).catch((err) => {
            console.error(`FB Func: stravaGetToken -- Error : ${err}`);
            return reject(`FB Func: stravaGetToken -- Error : ${err}`); 
        });
    });
});

exports.stravaRefreshToken = functions.https.onCall((req, res) => {
    return new Promise((resolve, reject) => {
        console.log(`called stravaRefreshToken with request`);
        console.log(req);
        let refresh_token = undefined;
        if (req && req.refresh_token) {
            refresh_token = req.refresh_token;
        } else {
            return reject(`Error oin stravaRefreshToken - invalid parm - must provide refresh_token`);
        }

        const params = {
            client_id: config.strava.client_id,
            client_secret: config.strava.client_secret,
            refresh_token: refresh_token,
            grant_type: "refresh_token"
        };

        const URIRequest = "https://www.strava.com/oauth/token?" + 
            `client_id=${params.client_id}` +
            `&client_secret=${params.client_secret}` +
            `&code=${params.code}` +
            `&grant_type=${params.grant_type}`
            ;

        console.log(`URIRequest: ${URIRequest}`);

        axios.post(URIRequest).then((res) => {
            console.log("Successfully sent strava token request.  response info");

            // MJUST break up response since FB functions can not resolve this complex
            // res object as it has circular reference.  It causes an error;
            // Unhandled error RangeError: Maximum call stack size exceeded
            const clientResponse = {
                refresh_token: res.data.refresh_token,
                access_token: res.data.access_token,
                expires_at: res.data.expires_at,
                expires_in: res.data.expires_in,
            }

            // NOW, save the strave info to the user account, maybe do in client
            // Must Save access_toke, refresh_token, expires_at, accepted_scopes
        
            return resolve(clientResponse);
        }).catch((err) => {
            console.error(`FB Func: stravaGetToken -- Error : ${err}`);
            return reject(`FB Func: stravaGetToken -- Error : ${err}`); 
        });
    });
});

exports.testFunctions = functions.https.onCall((req, res) => {
    console.log(`called testFunction with req ${JSON.stringify(req)}`)
    return {message: "response OK"};
});

exports.fBFdeleteAuthUser = functions.https.onCall((req, res) => {
    let uid = req.uid;
    // delete the authUser
    // MUST RETURN A PROMISE!
    return admin.auth().deleteUser(uid)
        .then(() => {
            console.log('Successfully deleted auth user');
            return ({"uid" : uid});
        }).catch((err) => {
            if (/is no user/.test(err)) {
                return ({"uid" : uid});
            } else {
                console.error(`FB Func: fBFdeleteAuthUser -- Error deleting auth user: ${err}`);
                throw Error(`FB Func: fBFdeleteAuthUser -- Error deleting auth user: ${err}`);
                //  throw new functions.https.HttpsError('failed to connect' + err.message)
            }
        });

});

exports.fBFcreateAuthUser = functions.https.onCall((user, res) => {
    //console.log(`called fBFcreateAuthUser with req ${JSON.stringify(user)}`)
             
    // Generate random password if no password exists (meaning its created by someone else)
    if (!user.password || user.password === null || user.password === "") {
        let randomPassword = Math.random().toString(36).slice(-8);
        user.password = randomPassword;
    }
    // First, see if user already exists in auth
    // MUST return promise
    return new Promise((resolve, reject) => {
        admin.auth().getUserByEmail(user.email).then((user) => {
            // See the UserRecord reference doc for the contents of userRecord.
            let authUser = {};
            authUser = user;
            console.log(`Successfully fetched user data: ${JSON.stringify(authUser)}`);
            resolve(authUser);
        }).catch((err) => {
            console.log(`User does not yet exist in auth... creating`);
            // Create user
            admin.auth().createUser({
                email: user.email,
                emailVerified: false,
                password: user.password,
                displayName: `${user.firstName} ${user.lastName}`,
                disabled: false
            }).then((authUser) => {
                console.log(`Successfully added auth user: ${JSON.stringify(authUser)}`);
                resolve(authUser);
            }).catch((err) => {
                //throw Error(`Error creating auth user in fBFcreateAuthUser error: ${err}`);
                reject(`Error creating auth user in fBFcreateAuthUser error: ${err}`);
            });
        });  // get
    });
});


exports.fBFupdateTeam = functions.https.onCall((req, res) => {
    console.log(`In fBFupdateTeam with: req ${JSON.stringify(req)}`);

    let challengeUid = req.challengeUid;
    let team = req.team;

    console.log(`In fBFupdateTeam with: ORG: ${ORG}, ENV: ${ENV}, challengeUid: ${challengeUid}`);
    return new Promise((resolve, reject) => {
        let activitiesRef = undefined;
        let dbUsersRef = admin.firestore().collection(ORG).doc(ENV).collection("users");
        if (challengeUid && challengeUid != "") {
            activitiesRef = admin.firestore().collection(ORG).doc(ENV).collection("challenges").doc(challengeUid).collection(`activities`);
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

    console.log(`In fBFupdateActivityTeamName with: ORG: ${ORG}, ENV: ${ENV}, challengeUid: ${challengeUid}`);
    return new Promise((resolve, reject) => {
        let activitiesRef = undefined;
        if (challengeUid && challengeUid != "") {
            activitiesRef = admin.firestore().collection(ORG).doc(ENV).collection("challenges").doc(challengeUid).collection(`activities`);
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