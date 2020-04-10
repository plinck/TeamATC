const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');
const cors = require('cors')({origin: true});
const express = require('express');

admin.initializeApp(functions.config().firebase);

let ORG="ATC"
let ENV="prod"
let CHALLENGEUID=""

const app = express();

// I did these functions using expores since it was the simplest (maybe only) way
// to do a simple redirect to the strava auth page vs using gets etc,
app.get('/stravaauth', async (req, res) => {
    console.log(`called stravaSendAuthorizationRequest with environment ${req}`);
    
    const params = {
        client_id: "45739",
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

exports.stravaGetToken = functions.https.onCall((req, res) => {
    console.log(`called stravaSendAuthorizationRequest with environment ${JSON.stringify(req)}`);
    const code = req.code;

    // const params = {
    //     client_id: functions.config().strava.client_id,
    //     client_secret: functions.config().strava.client_secret,
    //     code: code,
    // };
    const params = {
        client_id: "45739",
        client_secret: "4122d6e687a84e38c4d81dee061752c5b331787f",
        code: code,
    };

    const URIRequest = "https://www.strava.com/oauth/token?" + 
    `client_id=${params.client_id}` +
    `&client_secret=${params.client_secret}` +
    `&code=${params.code}`
    ;

    return axios.post(URIRequest).then((res) => {
        console.log(`Successfully sent strava token request.  response is: ${JSON.stringify(res)}`);

        // const athlete = res.data.athlete;
        // const accessToken = res.data.access_token;
        // const stravaUserID = res.id;
        // const photoURL = res.profile;
        // const email = res.email;
        // const displayName = res.firstname + ' ' + res.lastname;

        // NOW, save the strave info to the user account, maybe do in client
        //const firebaseToken = await createFirebaseAccount(stravaUserID, displayName, photoURL, email, accessToken);
    
        return (res);
    }).catch((err) => {
        console.error(`FB Func: stravaGetToken -- Error : ${err}`);
        throw Error(`FB Func: stravaGetToken -- Error : ${err}`);
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


