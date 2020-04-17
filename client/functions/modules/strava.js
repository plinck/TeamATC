const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');
const cors = require('cors')({origin: true});
const express = require('express');
const ENV = require("./FirebaseEnvironment.js");
const uus = require("./updateUserWithStrava");
const updateUserWithStrava = uus.updateUserWithStrava;

const app = express();
app.get('/stravaauth', async (req, res) => {
    console.log(`called stravaSendAuthorizationRequest with environment ${req}`);
    const redirectURL = req.query.redirect_uri ? req.query.redirect_uri : ENV.FUNCTIONS_CONFIG.strava.redirect_uri;
    console.log(`redirectURL: ${redirectURL}`)
    console.log(`client_id: ${ENV.FUNCTIONS_CONFIG.strava.client_id}`)
    
    const params = {
        client_id: ENV.FUNCTIONS_CONFIG.strava.client_id,
        redirect_uri: redirectURL,
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
            client_id: ENV.FUNCTIONS_CONFIG.strava.client_id,
            client_secret: ENV.FUNCTIONS_CONFIG.strava.client_secret,
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
            // console.log("Successfully sent strava token request.  response info");

            // MUST break up response since FB functions can not resolve this complex
            // res object as it has circular reference.  It causes an error;
            // Unhandled error RangeError: Maximum call stack size exceeded
            const clientResponse = {
                refresh_token: res.data.refresh_token,
                access_token: res.data.access_token,
                expires_at: res.data.expires_at,
                expires_in: res.data.expires_in,
                athlete: res.data.athlete,
                athleteId: res.data.athlete.id,
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
            client_id: ENV.FUNCTIONS_CONFIG.strava.client_id,
            client_secret: ENV.FUNCTIONS_CONFIG.strava.client_secret,
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
            client_id: ENV.FUNCTIONS_CONFIG.strava.client_id,
            client_secret: ENV.FUNCTIONS_CONFIG.strava.client_secret,
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

exports.stravaGetActivities = functions.https.onCall((req, context) => {
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
        
        if (req && req.dateAfter) {
            dateAfter = req.dateAfter;
        } else {
            dateAfter = new Date();
            dateAfter.setDate(dateAfter.getDate()-14);
            // convert date to unix epoch timestamp
            dateAfter = Math.floor(dateAfter.getTime()/1000.0);
        }

        console.log(`stravaGetActivities access_token${access_token}, uid:${uid}, dateAfter: ${dateAfter}`);
        const params = {
            after: dateAfter,
            page: 1,
            per_page: 30,
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
            console.log("Successfully sent stravaGetActivities request.");

            // MUST break up response since FB functions can not resolve this complex
            // res object as it has circular reference.  It causes an error;
            // Unhandled error RangeError: Maximum call stack size exceeded

            // NOW, save the strava activites to this users activities
            // console.log("Response data (res.data)");
            // console.log(res.data);
            resolve(res.data);
        }).catch((err) => {
            console.error(`stravaGetActivities failed -- ${err}`);
            reject(`stravaGetActivities failed -- ${err}`); 
        });
    });
});