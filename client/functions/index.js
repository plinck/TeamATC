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
        let uid = undefined;
        if (req && req.code && req.uid) {
            code = req.code;
            uid = req.uid;
        } else {
            return reject(`Error in stravaGetToken - invalid parm - must provide code and uid`);
        }

        const params = {
            client_id: config.strava.client_id,
            client_secret: config.strava.client_secret,
            code: code,
            grant_type: "authorization_code"
        };

        const URIRequest = "https://www.strava.com/api/v3/oauth/token?" + 
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
            updateUserWithStrava(uid, clientResponse).then (() => {
                return resolve(clientResponse);
            }).catch((err) => {
                console.error(`FB Func: stravaGetToken in updateUserWithStrava -- Error : ${err}`);
                return reject(`FB Func: stravaGetToken in updateUserWithStrava -- Error : ${err}`); 
            });
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
        let uid = undefined;
        if (req && req.refresh_token && req.uid) {
            refresh_token = req.refresh_token;
            uid = req.uid;
        } else {
            return reject(`Error oin stravaRefreshToken - invalid parm - must provide uid and refresh_token`);
        }

        const params = {
            client_id: config.strava.client_id,
            client_secret: config.strava.client_secret,
            refresh_token: refresh_token,
            grant_type: "refresh_token"
        };

        const URIRequest = "https://www.strava.com/api/v3/oauth/token?" + 
            `client_id=${params.client_id}` +
            `&client_secret=${params.client_secret}` +
            `&refresh_token=${params.refresh_token}` +
            `&grant_type=${params.grant_type}`
            ;

        console.log(`URIRequest: ${URIRequest}`);

        axios.post(URIRequest).then((res) => {
            console.log("Successfully sent strava token refresh srequest.  response info");

            // MJUST break up response since FB functions can not resolve this complex
            // res object as it has circular reference.  It causes an error;
            // Unhandled error RangeError: Maximum call stack size exceeded
            const clientResponse = {
                refresh_token: res.data.refresh_token,
                access_token: res.data.access_token,
                expires_at: res.data.expires_at,
                expires_in: res.data.expires_in,
            }

            // NOW, save the strava info to the user account, maybe do in client
            // Must Save access_toke, refresh_token, expires_at, accepted_scopes
            updateUserWithStrava(uid, clientResponse).then (() => {
                return resolve(clientResponse);
            }).catch((err) => {
                console.error(`FB Func: stravaRefreshToken in updateUserWithStrava -- Error : ${err}`);
                return reject(`FB Func: stravaRefreshToken in updateUserWithStrava -- Error : ${err}`); 
            });
        }).catch((err) => {
            console.error(`FB Func: stravaRefreshToken axios.post(URIRequest) failed -- Error : ${err}`);
            return reject(`FB Func: stravaRefreshToken axios.post(URIRequest) failed -- Error : ${err}`); 
        });
    });
});

exports.stravaDeauthorize = functions.https.onCall((req, res) => {
    return new Promise((resolve, reject) => {
        console.log(`called stravaDeauthorize with request`);
        console.log(req);
        let access_token = undefined;
        let uid = undefined;
        if (req && req.access_token && req.uid) {
            access_token = req.access_token;
            uid = req.uid;
        } else {
            return reject(`Error in stravaDeauthorize - invalid parm - must provide uid and access_token`);
        }

        console.log(`stravaDeauthorize access_token${access_token}, uid:${uid}`);
        const params = {
            client_id: config.strava.client_id,
            client_secret: config.strava.client_secret,
            access_token: access_token,
        };

        const URIRequest = "https://www.strava.com/oauth/deauthorize?" + 
            `client_id=${params.client_id}` +
            `&client_secret=${params.client_secret}` +
            `&access_token=${params.access_token}`
            ;

        console.log(`URIRequest: ${URIRequest}`);

        axios.post(URIRequest, {
                headers: {
                    'Authorization': `Bearer ${access_token}`
                }
            }).then((res) => {
            console.log("Successfully sent stravaDeauthorize refresh request.");

            // MJUST break up response since FB functions can not resolve this complex
            // res object as it has circular reference.  It causes an error;
            // Unhandled error RangeError: Maximum call stack size exceeded
            const clientResponse = {
                refresh_token: res.data.refresh_token,
            }

            // NOW, save the strava info to the user account, maybe do in client
            // Must Save access_toke, refresh_token, expires_at, accepted_scopes
            const deauthorize = true;
            updateUserWithStrava(uid, clientResponse, deauthorize).then (() => {
                resolve(clientResponse);
            }).catch((err) => {
                console.error(`stravaDeauthorize->updateUserWithStrava -- ${err}`);
                reject(`stravaDeauthorize->updateUserWithStrava -- ${err}`); 
            });
        }).catch((err) => {
            console.error(`stravaDeauthorize failed -- ${err}`);
            reject(`stravaDeauthorize failed -- ${err}`); 
        });
    });
});

exports.stravaGetActivities = functions.https.onCall((req, res) => {
    // curl -X GET "https://www.strava.com/api/v3/athlete/activities?after=1546318800&page=1&per_page=30"
    // -H  "accept: application/json" -H  "authorization: Bearer access_token"
    return new Promise((resolve, reject) => {
        console.log(`called stravaGetActivities with request`);
        console.log(req);
        let access_token = undefined;
        let uid = undefined;
        let dateAfter = undefined;
        if (req && req.access_token && req.uid) {
            access_token = req.access_token;
            uid = req.uid;
        } else {
            return reject(`Error in stravaGetActivities - invalid parm - must provide uid and access_token`);
        }
        if (req.dateAfter) {
            dateAfter = new Date(req.dateAfter);
        } else {
            dateAfter = new Date();
            dateAfter.setDate(dateAfter.getDate()-365);
        }
        // convert date to unix epoch timestamp
        var unixDateAfter = Math.floor(dateAfter.getTime()/1000.0);

        console.log(`stravaGetActivities access_token${access_token}, uid:${uid}, dateAfter: ${dateAfter}`);
        const params = {
            after: unixDateAfter,
            page: 1,
            per_page: 100,
        };

        const URIRequest = "https://www.strava.com/api/v3/athlete/activities?" + 
            `after=${params.after}` +
            `&page=${params.page}` +
            `&per_page=${params.per_page}`
            ;

        console.log(`URIRequest: ${URIRequest}`);

        axios.get(URIRequest, {
                headers: {
                    'authorization': `Bearer ${access_token}`,
                    'accept': "application/json"
                }
            }).then((res) => {
            console.log("Successfully sent stravaGetActivities refresh request.");

            // MJUST break up response since FB functions can not resolve this complex
            // res object as it has circular reference.  It causes an error;
            // Unhandled error RangeError: Maximum call stack size exceeded
            resolve(res);

            // NOW, save the strava activites to this users activities

        }).catch((err) => {
            console.error(`stravaGetActivities failed -- ${err}`);
            reject(`stravaGetActivities failed -- ${err}`); 
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


// ===============================================================
// Local - non-exported functions
// ===============================================================
updateUserWithStrava = ((uid, stravaInfo, deauthorize) => {
    console.log(`In updateUserWithStrava with: ORG: ${ORG}, ENV: ${ENV}`);
    
    return new Promise((resolve, reject) => {
        let userStravaUpdate = stravaInfo;

        if (deauthorize) {
            userStravaUpdate = {
                stravaUserAuth : false,
                refresh_token: null,
                access_token: null,
                expires_at: null
            }
        } else {
            userStravaUpdate.stavaUserAuth = true;
        }
        console.log(`In updateUserWithStrava with uid ${uid}, userStravaUpdate: ${JSON.stringify(userStravaUpdate, null,2)}`);

        // convert UTC EPOCH date (seconds since epoch) to JS Date
        let expiresAt = userStravaUpdate.expires_at  && userStravaUpdate.expires_at !== null ? new Date(userStravaUpdate.expires_at * 1000) : null;

        let dbUsersRef = admin.firestore().collection(ORG).doc(ENV).collection("users");

        dbUsersRef.doc(uid).set({
            stravaUserAuth: userStravaUpdate.stravaUserAuth ? userStravaUpdate.stravaUserAuth : false,
            stravaRefreshToken : userStravaUpdate.refresh_token ? userStravaUpdate.refresh_token : null,
            stravaAccessToken : userStravaUpdate.access_token ? userStravaUpdate.access_token : null,
            stravaExpiresAt : expiresAt ? expiresAt : null,
        }, { merge: true }).then(() => {
            console.log("User successfully updated with Strava Info!");
            resolve();
        }).catch((err) =>{
            console.error("Batch failed: ", err);
            reject(err);
        });

    }); // Promise
    
});
