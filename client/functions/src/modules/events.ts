import * as admin from 'firebase-admin';
import axios from 'axios';
import { APP_CONFIG } from "./FirebaseEnvironment";
import { refreshToken } from "./refreshToken";
import { addStravaActivity } from "./addStravaActivity";

// ===============================================================
// local not exported/helperfunctions
// ===============================================================
const updateActivity = ((user: any, accessToken:string, stravaActivityId: string) => {
    return new Promise((resolve, reject) => {
        const stravaAccessToken = accessToken;
        // get the activity
        console.log(`In updateActivity. Athlete Id ${user.stravaAthleteId},displayName: ${user.displayName},challengeUid: ${user.challengeUid},teamName: ${user.teamName},strava ActivyId: ${stravaActivityId},`);

        if (stravaAccessToken) {
            const URIRequest = `https://www.strava.com/api/v3/activities/${stravaActivityId}`;
            console.log(`URIRequest: ${URIRequest}`);
            axios.get(URIRequest,
                { headers: { 'Authorization': `Bearer ${stravaAccessToken}` } }
            ).then((res) => {
                // console.log(`activity from Strava: ${JSON.stringify(res.data, null, 4)}`);
                console.log(`Success retrieving activity from Strava Type: ${res.data.type}, id: ${res.data.id}`);

                //Now add the activity to DB
                addStravaActivity(user, res.data).then(_ => {
                    console.log(`Activity added to firestore successful`);
                    resolve();
                }).catch(err => {
                    console.error(`Error adding activity to firestore err:${err}`);   
                    reject(err);                   
                })
            }).catch (err => {
                console.error(`Error getting activity from strava, err ${err}`); 
                reject(err);                   
            });
        } else {
            console.error(`Invalid access_token for user:${user.displayName}`); 
            reject(`Invalid access_token for user:${user.displayName}`);                   
        }
    }); // Promise

});

const saveStravaEvent = ( (event : any) => {
    return new Promise((resolve, reject) => {
        // console.log(`In saveStravaEvent with: ORG: ${APP_CONFIG.ORG}, ENV: ${APP_CONFIG.ENV}`);
        console.log(JSON.stringify(event,null,4));

        // make sure its an activity create event
        if (event.aspect_type !== "create" || event.object_type !== "activity") {
            console.log(`In saveStravaEvent -- aspect_type and object_type is NOT new activity`);
            resolve();
        }
        console.log(`In saveStravaEvent -- new activity`);
        const stravaAthleteId = event.owner_id;
        const stravaActivityId = event.object_id;
    
        let foundUser = false;
        let user: any;
        const dbUsersRef = admin.firestore().collection(APP_CONFIG.ORG).doc(APP_CONFIG.ENV).collection("users");
        console.log(`Looking for Strava Athlete with id: ${stravaAthleteId} in user collection`);
        dbUsersRef.where("stravaAthleteId", "==", stravaAthleteId).limit(1).get().then((querySnapshot) => {
            console.log(`User Collection Size: ${querySnapshot.size}`);
            querySnapshot.forEach(doc => {
                foundUser = true;
                user = doc.data();
                user.id = doc.id;
                user.stravaExpiresAt = user.stravaExpiresAt ? user.stravaExpiresAt.toDate() : null;
            });
            if (foundUser) {
                console.log(`Found User. Athlete Id ${stravaAthleteId}, displayName: ${user.displayName}, challengeUid: ${user.challengeUid}, teamName: ${user.teamName} `);
                // check to make sure access token not expired
                const today = new Date();
                if (!user.stravaExpiresAt || today > user.stravaExpiresAt) {
                    // Must refresh users access token
                    const req = {"uid" : user.id, "refresh_token" : user.stravaRefreshToken};
                    console.log(`Calling refreshToken with stravaRefreshToken: ${user.stravaRefreshToken}, stravaAccessToken: ${user.stravaAccessToken}`);

                    refreshToken(req).then(pStravaInfo => {
                        // console.log(`Refreshed stravaInfo.access_token: ${stravaInfo.access_token}`);
                        const stravaInfo: any = pStravaInfo;
                        updateActivity(user, stravaInfo.access_token, stravaActivityId).then (() => {
                            // done
                            resolve();
                        }).catch(err => {
                            // 
                            reject(err);
                        });
                    }).catch(err1 => {
                        console.error(`Error in refreshToken - ${err1}`);
                        reject(`Error in refreshToken - ${err1}`);
                    });
                } else {
                    // console.log(`Used user.stravaAccessToken: ${user.stravaAccessToken}`);
                    updateActivity(user, user.stravaAccessToken, stravaActivityId).then(() => {
                        // done
                        resolve();
                    }).catch(err => {
                        // 
                        reject(err);
                    });
                }
            } else {
                console.error(`Can not find user with stravaAthleteId:${stravaAthleteId}`);
                reject(`Can not find user with stravaAthleteId:${stravaAthleteId}`);
            }
        }).catch((err: any) =>{
            console.error(`Error retrieving user with stravaAthleteId:${stravaAthleteId} , error: ${err}`);
            reject(`Error retrieving user with stravaAthleteId:${stravaAthleteId} , error: ${err}`);
        });
    });//promise    
});

export { saveStravaEvent };