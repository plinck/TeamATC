import * as functions from 'firebase-functions';
import { FUNCTIONS_CONFIG } from "./FirebaseEnvironment";
import axios from 'axios';
// import cors from 'cors';
import * as express from 'express';
import { updateUserWithStrava } from "./updateUserWithStrava";
import { refreshToken } from "./refreshToken";

const app = express();
app.get('/stravaauth', async (req:any, res:any) => {
    console.log(`called stravaSendAuthorizationRequest with environment ${req}`);
    const redirectURL = req.query.redirect_uri ? req.query.redirect_uri : FUNCTIONS_CONFIG.strava.redirect_uri;
    console.log(`redirectURL: ${redirectURL}`)
    console.log(`client_id: ${FUNCTIONS_CONFIG.strava.client_id}`)
    
    const params = {
        client_id: FUNCTIONS_CONFIG.strava.client_id,
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
        res.redirect(`${redirectURL}?error=BadRequest`);
        return res.status(401).json(`Error Caught in OAuth server request: ${err}`);
    }

});
exports.oauth = functions.https.onRequest(app);

// This gets the token after the user has authorized the app to use strava
exports.stravaGetToken = functions.https.onCall((req:any, context:any) => {
    return new Promise((resolve, reject) => {
        console.log(`called stravaGetToken with request`);
        console.log(req);
        let code:string = "";
        let uid:string = "";
        if (req && req.code && req.uid) {
            code = req.code;
            uid = req.uid;
        } else {
            reject(`Error in stravaGetToken - invalid parm - must provide code and uid`);
        }

        const params = {
            client_id: FUNCTIONS_CONFIG.strava.client_id,
            client_secret: FUNCTIONS_CONFIG.strava.client_secret,
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
        axios.post(URIRequest).then((response:any) => {
            // console.log("Successfully sent strava token request.  response info");

            // MUST break up response since FB functions can not resolve this complex
            // res object as it has circular reference.  It causes an error;
            // Unhandled error RangeError: Maximum call stack size exceeded
            const clientResponse = {
                refresh_token: response.data.refresh_token,
                access_token: response.data.access_token,
                expires_at: response.data.expires_at,
                expires_in: response.data.expires_in,
                athlete: response.data.athlete,
                athleteId: response.data.athlete.id,
            }

            // NOW, save the strava info to the user account, maybe do in client
            // Must Save access_toke, refresh_token, expires_at, accepted_scopes
            updateUserWithStrava(uid, clientResponse, false).then (() => {
                resolve(clientResponse);
            }).catch((err:any) => {
                console.error(`FB Func: stravaGetToken in updateUserWithStrava -- Error : ${err}`);
                reject(`FB Func: stravaGetToken in updateUserWithStrava -- Error : ${err}`); 
            });
        }).catch((err2:any) => {
            console.error(`FB Func: stravaGetToken -- Error : ${err2}`);
            reject(`FB Func: stravaGetToken -- Error : ${err2}`); 
        });
    });
});

// refactored the code into separate file so I could share front and backend calling
exports.stravaRefreshToken = functions.https.onCall(refreshToken);

exports.stravaDeauthorize = functions.https.onCall((req:any, context:any) => {
    return new Promise((resolve, reject) => {
        console.log(`called stravaDeauthorize with request`);
        console.log(req);
        let access_token:string = "";
        let uid:string = "";
        if (req && req.access_token && req.uid) {
            access_token = req.access_token;
            uid = req.uid;
        } else {
            reject(`Error in stravaDeauthorize - invalid parm - must provide uid and access_token`);
        }

        console.log(`stravaDeauthorize access_token${access_token}, uid:${uid}`);
        const params = {
            client_id: FUNCTIONS_CONFIG.strava.client_id,
            client_secret: FUNCTIONS_CONFIG.strava.client_secret,
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
            }).then((response: any) => {
                console.log("Successfully sent stravaDeauthorize refresh request.");

                // MJUST break up response since FB functions can not resolve this complex
                // res object as it has circular reference.  It causes an error;
                // Unhandled error RangeError: Maximum call stack size exceeded
                const clientResponse = {
                    refresh_token: response.data.refresh_token,
                }

                // NOW, save the strava info to the user account, maybe do in client
                // Must Save access_toke, refresh_token, expires_at, accepted_scopes
                updateUserWithStrava(uid, clientResponse, true).then (() => {
                    resolve(clientResponse);
                }).catch((err:any) => {
                    console.error(`stravaDeauthorize->updateUserWithStrava -- ${err}`);
                    reject(`stravaDeauthorize->updateUserWithStrava -- ${err}`); 
                });
        }).catch((err2: any) => {
            console.error(`stravaDeauthorize failed -- ${err2}`);
            reject(`stravaDeauthorize failed -- ${err2}`); 
        });
    });
});

exports.stravaGetActivities = functions.https.onCall((req:any, context:any) => {
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
            reject(`Error in stravaGetActivities - invalid parm - must provide uid and access_token`);
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
            }).then((res:any) => {
            console.log("Successfully sent stravaGetActivities request.");

            // MUST break up response since FB functions can not resolve this complex
            // res object as it has circular reference.  It causes an error;
            // Unhandled error RangeError: Maximum call stack size exceeded

            // NOW, save the strava activites to this users activities
            // console.log("Response data (res.data)");
            // console.log(res.data);
            resolve(res.data);
        }).catch((err:any) => {
            console.error(`stravaGetActivities failed -- ${err}`);
            reject(`stravaGetActivities failed -- ${err}`); 
        });
    });
});