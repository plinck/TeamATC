import axios from "axios";
import Util from "../Util/Util";
import { FB_CONFIG, STRAVA_CONFIG } from "../Environment/Environment.js"

class StravaAPI {
    static refreshToken(code, state) {
        console.log(`Refreshing Token with code: ${code} state: ${state}`);
    }

    static sendAuthRequestExpress(redirectUrl) {
        let URIRequest = undefined;
        if (redirectUrl) {
            URIRequest=`https://us-central1-${FB_CONFIG.PROJECT_ID}.cloudfunctions.net/oauth/stravaauth?redirect_uri=${redirectUrl}`;
        } else {
            URIRequest=`https://us-central1-${FB_CONFIG.PROJECT_ID}.cloudfunctions.net/oauth/stravaauth`;        
        }

        window.location.replace(URIRequest);
    }

    static sendStravaSubscribeRequest(callbackUrl) {
        return new Promise((resolve, reject) => {
            let URIRequest = undefined;
            if (callbackUrl) {
                URIRequest=`https://us-central1-${FB_CONFIG.PROJECT_ID}.cloudfunctions.net/webhook/subscribe?callback_url=${callbackUrl}`;
            } else {
                URIRequest=`https://us-central1-${FB_CONFIG.PROJECT_ID}.cloudfunctions.net/webhook/subscribe`;        
            }

            axios.get(URIRequest).then((res) => {
                console.log("Successfully sent strava token request.  response info");
                console.log(res);  
                resolve("Success");
            }).catch ((err) => {
                console.error(`Error Caught in /subscribe server request: ${err}`);
                reject(`Error Caught in /subscribe server request: ${err}`);
            });
        });
    }

    static getOAuthToken(uid, code) {
        console.log(`getOAuthToken Token with code: ${code}`);
        return new Promise((resolve, reject) => {
            const firebase = Util.getFirebaseAuth();
            const stravaGetToken = firebase.functions.httpsCallable('stravaGetToken');
            const req = {"uid" : uid, "code": code};
            
            stravaGetToken(req).then( (res) => {
                // Read result of the Cloud Function.
                console.log(`Success gettng token, response.data: ${JSON.stringify(res.data)}`);
                resolve(res.data);
            }).catch(err => {
                console.error(`${err}`);
                reject(err);
            });
        });
    }

    static refreshStravaToken(uid, refresh_token) {
        console.log(`refreshStravaToken Token with refresh_token: ${refresh_token}`);
        return new Promise((resolve, reject) => {
            const firebase = Util.getFirebaseAuth();
            const stravaRefreshToken = firebase.functions.httpsCallable('stravaRefreshToken');
            const req = {"uid" : uid, "refresh_token": refresh_token};
            
            stravaRefreshToken(req).then( (res) => {
                // Read result of the Cloud Function.
                console.log(`Success refreshing token, response.data: ${JSON.stringify(res.data)}`);
                resolve(res.data);
            }).catch(err => {
                console.error(`${err}`);
                reject(err);
            });
        });
    }

    static deauthorizeStrava(uid, access_token) {
        console.log(`deauthorizeStrava Token with access_token: ${access_token}`);
        return new Promise((resolve, reject) => {
            const firebase = Util.getFirebaseAuth();
            const stravaDeauthorize = firebase.functions.httpsCallable('stravaDeauthorize');
            const req = {"uid" : uid, "access_token": access_token};
            
            stravaDeauthorize(req).then( (res) => {
                // Read result of the Cloud Function.
                console.log(`Success stravaDeauthorize, response.data: ${JSON.stringify(res.data)}`);
                resolve(res.data);
            }).catch(err => {
                console.error(`${err}`);
                reject(err);
            });
        });
    }

    static getStravaActivities(uid, access_token) {
        console.log(`getStravaActivities Token with access_token: ${access_token}`);
        return new Promise((resolve, reject) => {
            const firebase = Util.getFirebaseAuth();
            const stravaGetActivities = firebase.functions.httpsCallable('stravaGetActivities');
            let dateAfter = new Date("2019-12-01");
            let unixDateAfter = Math.floor(dateAfter.getTime()/1000.0);

            const req = {"dateAfter" : unixDateAfter, "uid" : uid, "access_token": access_token};
            
            stravaGetActivities(req).then( (res) => {
                // Read result of the Cloud Function.
                // console.log(`Success stravaGetActivities, response.data: ${JSON.stringify(res.data)}`);
                resolve(res.data);
            }).catch(err => {
                console.error(`${err}`);
                reject(err);
            });
        });
    }

    // depracted -- jsut here for reference
    static sendOAuthRequestFromClient(redirectUrl) {
        console.log(`called sendOAuthRequestFromClient from client`);

        const client_id = STRAVA_CONFIG.CLIENT_ID;
        const redirect_uri = redirectUrl ? redirectUrl : "http://localhost:3000/oauthredirect";
        const response_type = "code";
        const approval_prompt = "auto"
        const scope = "activity:read_all";
        const state = "STRAVA";
    
        const URIRequest = `https://www.strava.com/oauth/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=${response_type}&approval_prompt=${approval_prompt}&scope=${scope}&state=${state}`;

        window.location.replace(URIRequest);
    
        return;
    }
}

export default StravaAPI;