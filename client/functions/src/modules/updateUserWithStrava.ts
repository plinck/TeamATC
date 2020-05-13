import * as admin from 'firebase-admin';
import { APP_CONFIG } from "./FirebaseEnvironment";

// ===============================================================
// Local - non-exported functions
// ===============================================================
const updateUserWithStrava = ((uid: string, stravaInfo: any, deauthorize?: boolean) => {
    console.log(`In updateUserWithStrava with: ORG: ${APP_CONFIG.ORG}, ENV: ${APP_CONFIG.ENV}`);
    
    return new Promise((resolve, reject) => {
        let userStravaUpdate = stravaInfo;
        // convert UTC EPOCH date (seconds since epoch) to JS Date
        const expiresAt = stravaInfo.expires_at  && stravaInfo.expires_at !== null ? new Date(stravaInfo.expires_at * 1000) : null;

        if (deauthorize) {
            userStravaUpdate = {
                stravaAthleteId : null,
                stravaUserAuth : false,
                stravaRefreshToken: null,
                stravaAccessToken: null,
                stravaExpiresAt: null
            }
        } else {
            userStravaUpdate = {
                stravaUserAuth : true,
                stravaRefreshToken: stravaInfo.refresh_token ? stravaInfo.refresh_token : null,
                stravaAccessToken: stravaInfo.access_token ? stravaInfo.access_token : null,
                stravaExpiresAt: expiresAt,
            }
            // Dont include athlete ID if it isnt passed so not to overrwrite (e.g. on tokenRefresh)
            if (stravaInfo.athleteId) {
                userStravaUpdate.stravaAthleteId = stravaInfo.athleteId;
            }

        }
        console.log(`In updateUserWithStrava with uid ${uid}`);

        const dbUsersRef = admin.firestore().collection(APP_CONFIG.ORG).doc(APP_CONFIG.ENV).collection("users");

        dbUsersRef.doc(uid).set(userStravaUpdate, { merge: true }).then(() => {
            console.log(`updateUserWithStrava User successfully updated with Strava Info`);
            resolve();
        }).catch((err) =>{
            console.error("updateUserWithStrava failed: ", err);
            reject(err);
        });

    }); // Promise
    
});

export { updateUserWithStrava };